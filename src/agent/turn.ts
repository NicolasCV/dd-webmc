import type { RegisteredTool } from '@mcp-b/webmcp-types'
import { ACT_NAMES } from '../game/sheet'
import { setOwnTurn } from '../game/tools'
import { MAX_STEPS, TURN_BUDGET, useGame } from '../store'
import { callTool, listTools, toInputSchema } from '../webmcp/context'
import { repair, type Msg } from './repair.ts'
import { liveDefs, settled } from '../webmcp/registry'


// Deliberately thin. The character does not live here — it lives in which tools are
// registered and how they are described. This prompt only establishes that speech
// happens through tools at all.
// Frame only. Who the character is lives entirely in which tools are registered and
// how they are described -- nothing here describes a personality, and nothing here
// tells the model to stay in character.
const SYSTEM =
  'You are a character in a tabletop scene, playing opposite one human player. ' +
  'You act and speak only by calling the tools available to you. Never reply in ' +
  'plain prose — if no tool fits what you want to do, you cannot do it. Call one ' +
  'tool, then stop and wait. Everything said to you is said inside the scene, and ' +
  'you answer inside it: you are not a chat assistant and have nothing to offer ' +
  'outside the fiction. A narrator describes the rooms, the dice and what happens ' +
  'to you both — that job is taken. Never restate, summarise or re-describe what ' +
  'the narrator has just said; say only what your character would add to it.'

let history: Msg[] = [{ role: 'system', content: SYSTEM }]


export const resetHistory = () => {
  history = [{ role: 'system', content: SYSTEM }]
}

const toOpenAITool = (t: RegisteredTool) => ({
  type: 'function' as const,
  function: {
    name: t.name,
    description: t.description,
    parameters: toInputSchema(t.inputSchema) ?? { type: 'object', properties: {} },
  },
})

let lastTrigger: string | null = null
export const retry = () => (lastTrigger ? agentTurn(lastTrigger) : undefined)

export async function agentTurn(trigger: string) {
  const { halted, busy, soloAgent, turns, setBusy, setError, spendTurn } = useGame.getState()
  // In solo mode an external agent is the only thing driving the companion.
  if (halted || busy || soloAgent) return
  if (turns >= TURN_BUDGET)
    return setError(
      'That was the last of 40 turns — the cap on this shared demo key. Restart keeps your companion and clears the log.',
    )

  lastTrigger = trigger
  setBusy(true)
  setOwnTurn(true)
  setError(null)
  spendTurn()
  history.push({ role: 'user', content: trigger })

  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      if (useGame.getState().halted) break

      // The registry may still be swapping tools out from under us -- on a room change,
      // or on the first turn after a character is picked. Read it only once it is settled.
      await settled()
      const registered = await listTools()
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: repair(history), tools: registered.map(toOpenAITool) }),
        signal: AbortSignal.timeout(20_000),
      })
      if (!res.ok) throw new Error(String(res.status))

      const message = (await res.json()) as Msg
      history.push(message)

      // Free-text content is dropped on purpose. Rendering it would let the model
      // speak outside its registered acts, which is exactly the leak this is about.
      const calls = message.tool_calls ?? []
      if (calls.length === 0) {
        // tool_choice is 'auto', so prose is possible -- and prose renders nothing at
        // all. One free retry inside the same turn, then say so out loud.
        if (step === 0) {
          history.push({ role: 'user', content: 'Answer by calling one tool.' })
          continue
        }
        useGame.getState().setError('They said nothing you could hear. Say it again.')
        break
      }

      // Every tool_call must get a tool message back, without exception. A throw in
      // here used to leave the assistant message unanswered in history, and since
      // history outlives the turn, every later request 400'd -- including the retry.
      for (const call of calls) {
        // Pause has to stop the acts, not just the loop -- otherwise the companion
        // speaks and the narration plays after you press it.
        if (useGame.getState().halted) {
          history.push({ role: 'tool', tool_call_id: call.id, content: 'interrupted.' })
          continue
        }
        let out: string
        try {
          const tool = registered.find((t) => t.name === call.function.name)
          if (!tool) throw new Error('not something you can do here')
          let args: unknown = {}
          try {
            args = JSON.parse(call.function.arguments || '{}')
          } catch {
            /* malformed args reach the tool as {} */
          }
          out = await callTool(tool, args, liveDefs())
        } catch (err) {
          // Same shape as a failed roll, so it reads as a fact about the world rather
          // than as a system error the companion then narrates to the player.
          out = `${call.function.name} → ${err instanceof Error ? err.message : String(err)}.`
        }
        history.push({ role: 'tool', tool_call_id: call.id, content: out })
      }

      // An utterance ends the turn. Without this the model keeps its remaining
      // steps and rephrases itself until the cap, which reads as babbling. A move
      // ends it too: otherwise it spends the rest of the steps walking, and the log
      // fills with room descriptions nobody is there to read.
      const ends = (name: string) => ACT_NAMES.includes(name) || name.startsWith('move_')
      if (calls.some((c) => ends(c.function.name))) break
    }
  } catch (err) {
    // In fiction, because a stack trace in a dungeon is a dead end for a judge. The
    // detail stays in devtools rather than being narrated to the player.
    console.error(err)
    const status = err instanceof Error ? err.message : ''
    const quiet = err instanceof DOMException && err.name === 'TimeoutError'
    setError(
      status === '429'
        ? 'They are talking over each other somewhere. Wait a beat and say it again.'
        : quiet || ['502', '503', '504'].includes(status)
          ? 'They are not answering. Say it again.'
          : 'Something out here dropped the line. Say it again.',
    )
  } finally {
    setOwnTurn(false)
    setBusy(false)
  }
}
