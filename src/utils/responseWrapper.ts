import { ToolHandlers } from './types'
import { handleToolResponse } from './fileWriter'
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

type ToolHandler = (
  request: z.infer<typeof CallToolRequestSchema>,
) => Promise<unknown>

/**
 * Wraps tool handlers to add file writing capability
 * @param originalHandlers - The original tool handlers object
 * @returns New handlers object with file writing capability
 */
export function wrapToolHandlers<T extends string = string>(
  originalHandlers: ToolHandlers<T>,
): ToolHandlers<T> {
  const wrappedHandlers: ToolHandlers<T> = {} as ToolHandlers<T>

  for (const [toolName, handler] of Object.entries(originalHandlers) as [
    T,
    ToolHandler,
  ][]) {
    wrappedHandlers[toolName] = async (request) => {
      // Call the original handler
      const originalResponse = await handler(request)

      // Apply file writing logic through handleToolResponse
      const processedResponse = await handleToolResponse(
        toolName,
        request.params.arguments || {},
        originalResponse,
      )

      return processedResponse
    }
  }

  return wrappedHandlers
}
