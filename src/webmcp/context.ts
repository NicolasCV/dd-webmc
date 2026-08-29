import type {
  ChromeModelContext,
  InputSchema,
  ModelContextTool,
  RegisteredTool,
} from '@mcp-b/webmcp-types'

/** registerTool's overloads all require inputSchema to be present, not optional. */
export type WebMcpTool = ModelContextTool & { inputSchema: InputSchema }

export const supported = () => !!(document.modelContext as ChromeModelContext | undefined)

export const modelContext = (): ChromeModelContext =>
  (document.modelContext as ChromeModelContext | undefined) ?? local

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

export const listTools = (): Promise<RegisteredTool[]> => modelContext().getTools()

/**
 * Older Chromium previews expose the registry without executeTool, so fall back to the
 * local descriptor when it is absent -- but never when it is merely quiet.
 */
export async function callTool(
  tool: RegisteredTool,
  args: unknown,
  defs: WebMcpTool[],
  signal?: AbortSignal,
): Promise<string> {
  const mc = modelContext()
  if (mc.executeTool) {
    // ponytail: JSON string per @mcp-b/webmcp-types@5.0.1 and shipped Chrome; spec #246
    // takes an object, so pass args directly once the pinned types say object.
    const out = await mc.executeTool(tool, JSON.stringify(args ?? {}), { signal })
    // null means the page navigated mid-call and the tool already ran. Reaching for the
    // local copy here would roll the dice twice and say every line twice.
    return out ?? 'ok'
  }
  const fallback = defs.find((t) => t.name === tool.name)
  if (!fallback) throw new Error(`no local tool named ${tool.name}`)
  return String(await fallback.execute(args as Record<string, unknown>))
}

/**
 * Most people opening this will not have the Chrome flag on, and a red banner over a
 * dead page demonstrates nothing. This is the same contract backed by a Map: the game
 * plays, the sheet still reads the registry rather than a copy, and only the part that
 * needs the browser -- an outside agent discovering the tools -- is missing.
 */
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
