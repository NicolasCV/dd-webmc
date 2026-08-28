import type { RegisteredTool } from '@mcp-b/webmcp-types'
import { ACT_NAMES } from '../game/sheet'
import { setOwnTurn } from '../game/tools'
import { MAX_STEPS, TURN_BUDGET, useGame } from '../store'
import { callTool, listTools, toInputSchema } from '../webmcp/context'
import { liveDefs, settled } from '../webmcp/registry'

type ToolCall = { id: string; function: { name: string; arguments: string } }
type Msg = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content?: string | null
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

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
  'outside the fiction.'

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
  const { halted, busy, turns, setBusy, setError, spendTurn } = useGame.getState()
  if (halted || busy) return
  if (turns >= TURN_BUDGET) return setError('Turn budget spent. Restart to keep playing.')

  lastTrigger = trigger
  setBusy(true)
  setOwnTurn(true)
  setError(null)
  spendTurn()
  history.push({ role: 'user', content: trigger })

  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      if (useGame.getState().halted) break

      const registered = await listTools()
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history, tools: registered.map(toOpenAITool) }),
        signal: AbortSignal.timeout(20_000),
      })
      if (!res.ok) throw new Error(`chat ${res.status}: ${await res.text()}`)

      const message = (await res.json()) as Msg
      history.push(message)

      // Free-text content is dropped on purpose. Rendering it would let the model
      // speak outside its registered acts, which is exactly the leak this is about.
      const calls = message.tool_calls ?? []
      if (calls.length === 0) break

      for (const call of calls) {
        const tool = registered.find((t) => t.name === call.function.name)
        let out: string
        if (!tool) {
          out = `ERROR. No tool named ${call.function.name} is registered.`
        } else {
          let args: unknown = {}
          try {
            args = JSON.parse(call.function.arguments || '{}')
          } catch {
            /* malformed args reach the tool as {} */
          }
          out = await callTool(tool, args, liveDefs())
        }
        history.push({ role: 'tool', tool_call_id: call.id, content: out })
      }

      // A world tool may have changed the room, which changes the registry. Let the
      // reconcile finish before the next step reads it.
      await settled()

      // An utterance ends the turn. Without this the model keeps its remaining
      // steps and rephrases itself until the cap, which reads as babbling.
      if (calls.some((c) => ACT_NAMES.includes(c.function.name))) break
    }
  } catch (err) {
    // In fiction, because a stack trace in a dungeon is a dead end for a judge.
    const timedOut = err instanceof DOMException && err.name === 'TimeoutError'
    setError(
      timedOut
        ? 'They are not answering. Say it again.'
        : `Something went wrong out here: ${err instanceof Error ? err.message : String(err)}`,
    )
  } finally {
    setOwnTurn(false)
    setBusy(false)
  }
}
