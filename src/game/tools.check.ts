// Tool selection degrades past ~12 live tools, hence CEILING.
import assert from 'node:assert/strict'
import { presets } from './presets.ts'
import { computeTools } from './tools.ts'
import { rooms, START } from './world.ts'

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
assert.deepEqual(
  computeTools(null, START, []).map((t) => t.name),
  ['choose_companion', 'create_companion'],
  'the title screen holds only the two ways in',
)

// Every room reachable and every room exitable. Locked exits count: anything the
// companion cannot open, the player can attempt themselves.
const seen = new Set([START])
const queue = [START]
while (queue.length) {
  const room = rooms[queue.shift()!]
  assert.ok(room.exits.length > 0, `${room.id} is a dead end`)
  for (const e of room.exits)
    if (!seen.has(e.to)) {
      seen.add(e.to)
      queue.push(e.to)
    }
}
assert.equal(seen.size, Object.keys(rooms).length, 'not every room is reachable')

console.log(`tools.check.ts ok — ${cases} combinations, peak ${worst.n} (${worst.where})`)
