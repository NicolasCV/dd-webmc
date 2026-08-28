export type ToolCall = { id: string; function: { name: string; arguments: string } }
export type Msg = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content?: string | null
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

/**
 * The API rejects a whole conversation if any tool_call is unanswered, or if a tool
 * message answers nothing. History outlives the turn that built it, so one bad turn
 * would otherwise brick every turn after it -- including the retry.
 *
 * Drops assistant messages whose tool_calls were not all answered, then drops the tool
 * messages left answering nothing.
 */
export function repair(msgs: Msg[]): Msg[] {
  const answered = new Set<string>()
  for (const m of msgs) if (m.role === 'tool' && m.tool_call_id) answered.add(m.tool_call_id)

  const kept = msgs.filter(
    (m) => m.role !== 'assistant' || !m.tool_calls?.length || m.tool_calls.every((c) => answered.has(c.id)),
  )

  const live = new Set(kept.flatMap((m) => m.tool_calls?.map((c) => c.id) ?? []))
  return kept.filter((m) => m.role !== 'tool' || (m.tool_call_id ? live.has(m.tool_call_id) : false))
}
