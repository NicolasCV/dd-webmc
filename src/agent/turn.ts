import type { RegisteredTool } from '@mcp-b/webmcp-types'
import { ACT_NAMES } from '../game/sheet'
import { holdPeace, setOwnTurn, WAIT } from '../game/tools'
import { MAX_STEPS, TURN_BUDGET, useGame } from '../store'
import { callTool, listTools, toInputSchema } from '../webmcp/context'
import { repair, type Msg } from './repair.ts'
import { liveDefs, settled } from '../webmcp/registry'


// no personality here on purpose: the registered tools and their descriptions make the character
const SYSTEM =
  'You are a character in a tabletop scene, playing opposite one human player. ' +
  'You act and speak only by calling the tools available to you. Never reply in ' +
  'plain prose — if no tool fits what you want to do, you cannot do it. Take a ' +
  'step at a time: look at something, try something, speak — or say nothing at ' +
  'all and call wait_for_moment, which hands the moment back to them. Silence is ' +
  'a move; not every line of theirs is owed an answer, and when they act without asking ' +
  'you anything, holding still is usually truer than remarking on it. ' +
  'Everything said to you is said inside the scene, and ' +
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

      // registry swaps tools on room change and on first character pick; read after it settles
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

      // message.content is dropped on purpose: prose lets the model act outside its registered tools
      const calls = message.tool_calls ?? []
      if (calls.length === 0) {
        // server sends tool_choice 'auto', so a reply with no tool call happens; retry once
        if (step === 0) {
          history.push({
            role: 'user',
            content: 'Answer by calling one tool — wait_for_moment if you would rather hold your peace.',
          })
          continue
        }
        holdPeace()
        break
      }

      // every tool_call needs a tool message back; history outlives the turn, so a gap 400s later requests
      for (const call of calls) {
        // halt must skip the remaining calls, not only the loop, or acts run after pause
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
          }
          out = await callTool(tool, args, liveDefs())
        } catch (err) {
          // same shape as a failed roll, so the model reads a world fact, not a system error
          out = `${call.function.name} → ${err instanceof Error ? err.message : String(err)}.`
        }
        history.push({ role: 'tool', tool_call_id: call.id, content: out })
      }

      // stop after a speech act, a move, or a deliberate silence; else the model rephrases itself to the step cap
      const ends = (name: string) =>
        name === WAIT || ACT_NAMES.includes(name) || name.startsWith('move_')
      if (calls.some((c) => ends(c.function.name))) break
    }
  } catch (err) {
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
