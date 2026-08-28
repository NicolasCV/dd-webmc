import { useGame } from '../store'
import type { WebMcpTool } from '../webmcp/context'

export const brakka = {
  name: 'Brakka',
  oneLine: 'gruff mercenary, allergic to sincerity',
  attributes: { str: 15, dex: 9, wis: 7, cha: 6 },
}

const textSchema = {
  type: 'object',
  properties: { text: { type: 'string', description: 'The line, in his voice. One or two sentences.' } },
  required: ['text'],
} as const

// Descriptions are the only channel the model learns the character through, so they
// are written in voice. "Mock the player." would produce a chatbot doing an accent.
const acts: Array<{ name: string; description: string }> = [
  {
    name: 'mock',
    description:
      "Say something cutting. You do this when someone is being soft, including " +
      "when they're scared — especially then. Keep it short. You are not cruel " +
      "for its own sake, you just don't have another setting.",
  },
  {
    name: 'threaten',
    description:
      'Promise violence, plainly, to a person or a door or the dark. You have ' +
      'settled most of your problems this way and see no reason to stop. No ' +
      'posturing — you never say a thing you would not do.',
  },
  {
    name: 'state_flatly',
    description:
      'State a fact with nothing on it. No comfort, no colour, no softening ' +
      'clause at the end. This is what you reach for when someone wants ' +
      'reassurance, because it is the closest thing you have to it.',
  },
]

const speak = (act: string, text: string) => {
  useGame.getState().say('companion', text, act)
  return 'ok' // terse by design: prose here is what the model paraphrases warmly
}

export const speechActs: WebMcpTool[] = acts.map(({ name, description }) => ({
  name,
  description,
  inputSchema: textSchema,
  annotations: { readOnlyHint: false },
  execute: (input) => speak(name, String((input as { text?: unknown }).text ?? '')),
}))
