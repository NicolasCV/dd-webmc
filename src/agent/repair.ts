export type ToolCall = { id: string; function: { name: string; arguments: string } }
export type Msg = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content?: string | null
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

/** API rejects the whole history if a tool_call is unanswered. One bad turn bricks all later turns. */
export function repair(msgs: Msg[]): Msg[] {
  const answered = new Set<string>()
  for (const m of msgs) if (m.role === 'tool' && m.tool_call_id) answered.add(m.tool_call_id)

  const kept = msgs.filter(
    (m) => m.role !== 'assistant' || !m.tool_calls?.length || m.tool_calls.every((c) => answered.has(c.id)),
  )

  const live = new Set(kept.flatMap((m) => m.tool_calls?.map((c) => c.id) ?? []))
  return kept.filter((m) => m.role !== 'tool' || (m.tool_call_id ? live.has(m.tool_call_id) : false))
}
