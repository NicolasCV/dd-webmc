// Tool selection degrades past ~12 live tools, hence CEILING.
import assert from 'node:assert/strict'
import { presets } from './presets.ts'
import { computeTools } from './tools.ts'
import { rooms } from './world.ts'

const CEILING = 12

const FLAGS = [
  'door_open', 'sigil', 'tally', 'noise', 'read_seal',
  ...Object.values(rooms).flatMap((r) => r.props.map((p) => `seen_${p.id}`)),
]
const subsets = <T,>(xs: T[]): T[][] =>
  xs.reduce<T[][]>((acc, x) => [...acc, ...acc.map((s) => [...s, x])], [[]])

let worst = { n: 0, where: '' }
let cases = 0
for (const sheet of presets)
  for (const room of Object.keys(rooms))
    for (const flags of subsets(FLAGS)) {
      const tools = computeTools(sheet, room, flags)
      cases++
      assert.equal(new Set(tools.map((t) => t.name)).size, tools.length, `duplicate tool: ${sheet.name}/${room}`)
      if (tools.length > worst.n) worst = { n: tools.length, where: `${sheet.name} in ${room}` }
    }

assert.ok(worst.n <= CEILING, `live tools peaked at ${worst.n} (${worst.where}), ceiling is ${CEILING}`)
assert.equal(computeTools(null, 'landing', []).length, 0, 'no sheet, no tools')

// Every room reachable and every room exitable, whoever you brought.
for (const sheet of presets) {
  const seen = new Set(['landing'])
  for (const queue = ['landing']; queue.length; ) {
    const id = queue.shift()!
    const room = rooms[id]
    assert.ok(room.exits.length > 0, `${id} is a dead end`)
    // Anything the companion cannot open, the player can attempt themselves.
    for (const e of room.exits)
      if (!seen.has(e.to)) {
        seen.add(e.to)
        queue.push(e.to)
      }
  }
  assert.equal(seen.size, Object.keys(rooms).length, `${sheet.name} cannot reach every room`)
}

console.log(`tools.check.ts ok — ${cases} combinations, peak ${worst.n} (${worst.where})`)
