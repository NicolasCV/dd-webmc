import { useGame } from '../store'
import type { WebMcpTool } from '../webmcp/context'
import { brakka, speechActs } from './brakka'
import type { Challenge, Prop, Room } from './world'
import { roll, rooms } from './world'

const empty = { type: 'object', properties: {} } as const

const has = (skill: string) => brakka.skills.includes(skill as never)

const attempt = (c: Challenge) => {
  const g = useGame.getState()
  const r = roll(brakka.attributes[c.attr], c.dc)
  const line = `${c.id} → ${r.ok ? 'OK' : 'FAIL'}. ${r.total} vs DC ${r.dc}. ${r.ok ? c.success : c.fail}`
  g.setRoll({ ...r, of: c.id })
  g.say('world', line)
  const flag = r.ok ? c.sets : c.failSets
  if (flag) g.setFlag(flag)
  return line
}

export const examineProp = (p: Prop) => {
  const g = useGame.getState()
  g.say('world', p.onExamine, `examine_${p.id}`)
  if (p.reveals) g.setFlag(p.reveals)
  return p.onExamine
}

export const go = (to: string) => {
  const g = useGame.getState()
  const room = rooms[to]
  g.enter(to)
  g.setRoll(null)
  g.say('world', room.description, room.name)
  return `move_${to} → OK. ${room.name}.`
}

const challengeTool = (c: Challenge): WebMcpTool => ({
  name: c.id,
  description: c.description,
  inputSchema: empty,
  execute: () => attempt(c),
})

const examineTool = (p: Prop): WebMcpTool => ({
  name: `examine_${p.id}`,
  description: `Look at ${p.label}. Properly, not a glance. You will get back what is there and nothing about how it makes anyone feel.`,
  inputSchema: empty,
  annotations: { readOnlyHint: true },
  execute: () => examineProp(p),
})

const moveTool = (to: string): WebMcpTool => ({
  name: `move_${to}`,
  description: `Walk to ${rooms[to].name}. You go, and the other one follows or doesn't.`,
  inputSchema: empty,
  execute: () => go(to),
})

export const openExits = (room: Room, flags: string[]) =>
  room.exits.filter((e) => !e.needs || flags.includes(e.needs))

/** The single source of truth for what he can do right now. Keep the total under 12. */
export function computeTools(roomId: string, flags: string[]): WebMcpTool[] {
  const room = rooms[roomId]
  return [
    ...speechActs,
    ...(room.challenges ?? [])
      .filter((c) => has(c.skill) && !(c.gone && flags.includes(c.gone)))
      .map(challengeTool),
    ...room.props.slice(0, 3).filter((p) => !p.requires || has(p.requires)).map(examineTool),
    ...openExits(room, flags).map((e) => moveTool(e.to)),
  ]
}
