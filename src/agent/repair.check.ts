// node --experimental-strip-types src/agent/repair.check.ts
import assert from 'node:assert/strict'
import { repair, type Msg } from './repair.ts'

const call = (id: string): Msg['tool_calls'] => [{ id, function: { name: 'mock', arguments: '{}' } }]
const ok: Msg[] = [
  { role: 'system', content: 's' },
  { role: 'user', content: 'hi' },
  { role: 'assistant', tool_calls: call('a') },
  { role: 'tool', tool_call_id: 'a', content: 'ok' },
]
assert.deepEqual(repair(ok), ok, 'a well-formed transcript is untouched')

// The actual failure: callTool threw, so the assistant message never got its answer.
const orphanCall: Msg[] = [...ok.slice(0, 2), { role: 'assistant', tool_calls: call('b') }]
assert.deepEqual(repair(orphanCall), ok.slice(0, 2), 'unanswered tool_calls dropped')

// Two calls, only one answered -- the whole assistant message and its half-answer go.
const halfAnswered: Msg[] = [
  ...ok.slice(0, 2),
  { role: 'assistant', tool_calls: [...call('c'), ...call('d')] },
  { role: 'tool', tool_call_id: 'c', content: 'ok' },
]
assert.deepEqual(repair(halfAnswered), ok.slice(0, 2), 'partially answered message and its orphan both dropped')
assert.ok(!repair(halfAnswered).some((m) => m.role === 'tool'), 'no tool message answers nothing')

// A tool message whose assistant message was never recorded at all.
const orphanTool: Msg[] = [...ok.slice(0, 2), { role: 'tool', tool_call_id: 'zz', content: 'ok' }]
assert.deepEqual(repair(orphanTool), ok.slice(0, 2), 'stray tool message dropped')

// Every surviving tool message must follow a surviving assistant message that claims it.
const mixed: Msg[] = [...ok, { role: 'assistant', tool_calls: call('e') }, { role: 'user', content: 'next' }]
const out = repair(mixed)
assert.deepEqual(out, [...ok, { role: 'user', content: 'next' }], 'good turns survive alongside a bad one')

for (const m of out)
  if (m.role === 'tool')
    assert.ok(
      out.some((a) => a.tool_calls?.some((c) => c.id === m.tool_call_id)),
      'no orphan survived',
    )

console.log('repair.check.ts ok')
