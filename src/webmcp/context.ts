import type {
  ChromeModelContext,
  InputSchema,
  ModelContextTool,
  RegisteredTool,
} from '@mcp-b/webmcp-types'

/** registerTool overloads all require inputSchema. */
export type WebMcpTool = ModelContextTool & { inputSchema: InputSchema }

export const supported = () => !!document.modelContext

export const modelContext = (): ChromeModelContext =>
  (document.modelContext as ChromeModelContext | undefined) ?? local

// Chrome 149-153 (154 for same-document tools) returns inputSchema as a serialized string, not an object.
export function toInputSchema(schema: RegisteredTool['inputSchema']): InputSchema | undefined {
  if (!schema) return undefined
  if (typeof schema !== 'string') return schema
  try {
    return JSON.parse(schema) as InputSchema
  } catch {
    return undefined
  }
}

export const listTools = (): Promise<RegisteredTool[]> => modelContext().getTools()

/** Older Chromium has no executeTool. Fall back to the local tool only when it is absent. */
export async function callTool(
  tool: RegisteredTool,
  args: unknown,
  defs: WebMcpTool[],
): Promise<string> {
  const mc = modelContext()
  if (mc.executeTool) {
    // executeTool takes a JSON string in @mcp-b/webmcp-types@5.0.1 and shipped Chrome; spec #246 says object.
    const out = await mc.executeTool(tool, JSON.stringify(args ?? {}))
    // null means the page navigated mid-call and the tool already ran. Do not retry it locally.
    return out ?? 'ok'
  }
  const fallback = defs.find((t) => t.name === tool.name)
  if (!fallback) throw new Error(`no local tool named ${tool.name}`)
  return String(await fallback.execute(args as Record<string, unknown>))
}

/** Map-backed fallback when the browser has no document.modelContext. An outside agent cannot discover these tools. */
class LocalContext extends EventTarget {
  private tools = new Map<string, WebMcpTool>()

  registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }) {
    this.tools.set(tool.name, tool)
    options?.signal?.addEventListener(
      'abort',
      () => {
        if (this.tools.get(tool.name) === tool) this.tools.delete(tool.name)
        this.dispatchEvent(new Event('toolchange'))
      },
      { once: true },
    )
    this.dispatchEvent(new Event('toolchange'))
    return Promise.resolve()
  }

  getTools() {
    return Promise.resolve(
      [...this.tools.values()].map(({ name, description, inputSchema, annotations }) => ({
        name,
        description,
        inputSchema,
        annotations,
      })),
    )
  }

  async executeTool(tool: { name: string }, inputArguments: string) {
    const def = this.tools.get(tool.name)
    if (!def) throw new Error(`${tool.name} is not registered`)
    let args: unknown = {}
    try {
      args = JSON.parse(inputArguments || '{}')
    } catch {
      /* malformed args reach the tool as {} */
    }
    return String(await def.execute(args as Record<string, unknown>))
  }
}

const local = new LocalContext() as unknown as ChromeModelContext
