import { ExtendedTool, ToolHandlers } from '../../utils/types'
import { v2 } from '@datadog/datadog-api-client'
import { createToolSchema } from '../../utils/tool'
import { GetLogsZodSchema, GetAllServicesZodSchema } from './schema'

type LogsToolName = 'get_logs' | 'get_all_services'
type LogsTool = ExtendedTool<LogsToolName>

export const LOGS_TOOLS: LogsTool[] = [
  createToolSchema(
    GetLogsZodSchema,
    'get_logs',
    'Search and retrieve logs from Datadog',
  ),
  createToolSchema(
    GetAllServicesZodSchema,
    'get_all_services',
    'Extract all unique service names from logs',
  ),
] as const

type LogsToolHandlers = ToolHandlers<LogsToolName>

export const createLogsToolHandlers = (
  apiInstance: v2.LogsApi,
): LogsToolHandlers => ({
  get_logs: async (request) => {
    const { query, from, to, limit } = GetLogsZodSchema.parse(
      request.params.arguments,
    )

    const response = await apiInstance.listLogs({
      body: {
        filter: {
          query,
          // `from` and `to` are in epoch seconds, but the Datadog API expects milliseconds
          from: `${from * 1000}`,
          to: `${to * 1000}`,
        },
        page: {
          limit,
        },
        sort: '-timestamp',
      },
    })

    // only keep logs that are less than 30 minutes old
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000

    const filteredData = response.data?.filter(
      (log) =>
        log.attributes?.timestamp !== undefined &&
        log.attributes.timestamp.getTime() > thirtyMinutesAgo,
    )

    if (response.data == null) {
      throw new Error('No logs data returned')
    }

    return {
      content: [
        {
          type: 'text',
          text: `Logs data: ${JSON.stringify(filteredData)}`,
        },
      ],
    }
  },

  get_all_services: async (request) => {
    const { query, from, to, limit } = GetAllServicesZodSchema.parse(
      request.params.arguments,
    )

    const response = await apiInstance.listLogs({
      body: {
        filter: {
          query,
          // `from` and `to` are in epoch seconds, but the Datadog API expects milliseconds
          from: `${from * 1000}`,
          to: `${to * 1000}`,
        },
        page: {
          limit,
        },
        sort: '-timestamp',
      },
    })

    if (response.data == null) {
      throw new Error('No logs data returned')
    }

    // Extract unique services from logs
    const services = new Set<string>()

    for (const log of response.data) {
      // Access service attribute from logs based on the Datadog API structure
      if (log.attributes && log.attributes.service) {
        services.add(log.attributes.service)
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Services: ${JSON.stringify(Array.from(services).sort())}`,
        },
      ],
    }
  },
})
