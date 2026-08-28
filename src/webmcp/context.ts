import type {
  ChromeModelContext,
  InputSchema,
  ModelContextTool,
  RegisteredTool,
} from '@mcp-b/webmcp-types'

/** registerTool's overloads all require inputSchema to be present, not optional. */
export type WebMcpTool = ModelContextTool & { inputSchema: InputSchema }

export const modelContext = (): ChromeModelContext | undefined =>
  document.modelContext as ChromeModelContext | undefined

export const supported = () => !!modelContext()

export async function registerAll(tools: WebMcpTool[], signal: AbortSignal) {
  const mc = modelContext()
  if (!mc) return
  for (const tool of tools) {
    if (signal.aborted) return
    await mc.registerTool(tool, { signal })
  }
}

// Chrome 149-153 (and 154 for same-document tools) hand back a serialized string
// where the spec now says object. Branch on typeof and guard the parse.
export function toInputSchema(schema: RegisteredTool['inputSchema']): InputSchema | undefined {
  if (!schema) return undefined
  if (typeof schema !== 'string') return schema
  try {
    return JSON.parse(schema) as InputSchema
  } catch {
    return undefined
  }
}

export async function listTools(): Promise<RegisteredTool[]> {
  const mc = modelContext()
  return mc ? await mc.getTools() : []
}

/**
 * executeTool is an optional Chromium extension, not part of the standard
 * surface, so fall back to the local descriptor when it is absent.
 */
export async function callTool(
  tool: RegisteredTool,
  args: unknown,
  local: WebMcpTool[],
  signal?: AbortSignal,
): Promise<string> {
  const mc = modelContext()
  if (mc?.executeTool) {
    const out = await mc.executeTool(tool, JSON.stringify(args ?? {}), { signal })
    if (out !== null) return out
  }
  const fallback = local.find((t) => t.name === tool.name)
  if (!fallback) throw new Error(`no local tool named ${tool.name}`)
  return String(await fallback.execute(args as Record<string, unknown>))
}
