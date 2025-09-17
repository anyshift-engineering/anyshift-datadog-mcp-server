import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

// File output configuration
export const WRITE_TO_FILE = process.env.WRITE_TO_FILE === 'true'
export const OUTPUT_DIR = process.env.OUTPUT_DIR || ''

// Tool name abbreviations for compact filenames
const TOOL_ABBREVIATIONS: Record<string, string> = {
  // Incidents
  list_incidents: 'inc_list',
  get_incident: 'inc_get',

  // Metrics
  query_metrics: 'met_qry',

  // Logs
  search_logs: 'log_srch',
  get_log: 'log_get',
  list_logs: 'log_list',

  // Monitors
  list_monitors: 'mon_list',
  get_monitor: 'mon_get',
  create_monitor: 'mon_create',
  update_monitor: 'mon_update',

  // Dashboards
  list_dashboards: 'dash_list',
  get_dashboard: 'dash_get',
  create_dashboard: 'dash_create',
  update_dashboard: 'dash_update',

  // Traces
  search_spans: 'trace_srch',
  list_spans: 'trace_list',

  // Hosts
  list_hosts: 'host_list',
  get_host: 'host_get',
  mute_host: 'host_mute',
  unmute_host: 'host_unmute',

  // Downtimes
  list_downtimes: 'down_list',
  get_downtime: 'down_get',
  create_downtime: 'down_create',
  update_downtime: 'down_update',
  cancel_downtime: 'down_cancel',

  // RUM
  search_rum_events: 'rum_srch',
  list_rum_events: 'rum_list',
  aggregate_rum_events: 'rum_agg',

  // JQ Query (special case - bypasses file writing)
  execute_jq_query: 'jq',
}

// Generate compact timestamp using epoch + milliseconds
const generateCompactTimestamp = (): string => {
  const now = new Date()
  const epoch = Math.floor(now.getTime() / 1000)
  const ms = now.getMilliseconds().toString().padStart(3, '0')
  return `${epoch}${ms}`
}

// Generate short hash from arguments for collision resistance
const hashArgs = (args: Record<string, unknown>): string => {
  const argsString = Object.entries(args)
    .filter(
      ([key, value]) =>
        // Filter out sensitive or irrelevant keys
        !['api_key', 'app_key', 'token'].includes(key.toLowerCase()) &&
        value !== undefined,
    )
    .map(([key, value]) => `${key}=${value}`)
    .join('_')

  if (!argsString) return 'noargs'

  return crypto
    .createHash('md5')
    .update(argsString)
    .digest('hex')
    .substring(0, 6)
}

// Generate LLM-friendly compact filename
export const generateCompactFilename = (
  toolName: string,
  args: Record<string, unknown>,
): string => {
  const timestamp = generateCompactTimestamp()
  const toolAbbrev = TOOL_ABBREVIATIONS[toolName] || toolName.substring(0, 6)
  const argsHash = hashArgs(args)

  return `${timestamp}_${toolAbbrev}_${argsHash}.json`
}

// Helper function to analyze JSON structure and generate simple schema
function analyzeJsonSchema(obj: unknown, path: string = 'root'): unknown {
  if (obj === null) return { type: 'null' }
  if (obj === undefined) return { type: 'undefined' }

  const type = Array.isArray(obj) ? 'array' : typeof obj

  if (type === 'object') {
    const properties: Record<string, unknown> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        properties[key] = analyzeJsonSchema(obj[key], `${path}.${key}`)
      }
    }
    return { type: 'object', properties }
  } else if (type === 'array') {
    if (obj.length > 0) {
      // Analyze first item to determine array item type
      return {
        type: 'array',
        items: analyzeJsonSchema(obj[0], `${path}[0]`),
        length: obj.length,
      }
    }
    return { type: 'array', items: { type: 'unknown' }, length: 0 }
  } else {
    return { type }
  }
}

// Helper function to detect if a response contains an error
export const isErrorResponse = (response: unknown): boolean => {
  return response && (response.error || response.isError)
}

// Centralized response handler with file writing capability
export async function handleToolResponse(
  toolName: string,
  args: Record<string, unknown>,
  responseData: unknown,
): Promise<unknown> {
  // JQ query tool should always return directly to AI (never write to file)
  if (toolName === 'execute_jq_query') {
    return responseData
  }

  // If there's an error, always return it (never write errors to file)
  if (isErrorResponse(responseData)) {
    return responseData
  }

  // If WRITE_TO_FILE is false or no OUTPUT_DIR, just return the response
  if (!WRITE_TO_FILE || !OUTPUT_DIR) {
    return responseData
  }

  // Success case with WRITE_TO_FILE=true: write to file
  try {
    // Create compact, LLM-friendly filename
    const filename = generateCompactFilename(toolName, args)
    const filepath = path.join(OUTPUT_DIR, filename)

    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true })

    // Extract the actual data from MCP response format
    let contentToWrite: string
    let parsedForSchema: unknown

    if (responseData.content && Array.isArray(responseData.content)) {
      // Extract text from MCP response content
      const textContent = responseData.content
        .filter((item: unknown) => (item as { type?: string }).type === 'text')
        .map((item: unknown) => (item as { text: string }).text)
        .join('\n')

      try {
        // Try to parse the text as JSON for prettier formatting
        // Handle cases where text might contain "Listed incidents: {...}" or "Queried metrics data: {...}"
        let jsonText = textContent

        // Extract JSON from common response patterns
        const jsonMatch = textContent.match(/:\s*(\{.*\}|\[.*\])$/s)
        if (jsonMatch) {
          jsonText = jsonMatch[1]
        }

        const parsed = JSON.parse(jsonText)
        parsedForSchema = parsed
        contentToWrite = JSON.stringify(parsed, null, 2)
      } catch {
        // If parsing fails, write the raw text
        contentToWrite = textContent
      }
    } else {
      // Fallback: stringify the entire response
      contentToWrite = JSON.stringify(responseData, null, 2)
    }

    // TODO: Add file size limits for disk space management
    await fs.writeFile(filepath, contentToWrite)

    // Try to generate schema if we have valid JSON
    let schemaInfo = ''
    if (parsedForSchema) {
      const schema = analyzeJsonSchema(parsedForSchema)
      schemaInfo = `\n\nJSON Schema:\n${JSON.stringify(schema, null, 2)}`
    }

    // Count lines in the content
    const lineCount = contentToWrite.split('\n').length

    // Return success message with file path, size, lines, and schema
    return {
      content: [
        {
          type: 'text',
          text: `Response written to file: ${filepath}\nSize: ${contentToWrite.length} characters\nLines: ${lineCount}${schemaInfo}`,
        },
      ],
    }
  } catch (error) {
    // If file writing fails, return the original response
    console.error(`[handleToolResponse] Error writing file:`, error)
    return responseData
  }
}
