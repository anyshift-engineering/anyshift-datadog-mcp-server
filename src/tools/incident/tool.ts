import { ExtendedTool, ToolHandlers } from '../../utils/types'
import { v2 } from '@datadog/datadog-api-client'
import { createToolSchema } from '../../utils/tool'
import { GetIncidentZodSchema, ListIncidentsZodSchema } from './schema'
import { McpResponse } from '../../utils/responses/McpResponse'

type IncidentToolName = 'list_incidents' | 'get_incident'
type IncidentTool = ExtendedTool<IncidentToolName>

export const INCIDENT_TOOLS: IncidentTool[] = [
  createToolSchema(
    ListIncidentsZodSchema,
    'list_incidents',
    'Get incidents from Datadog',
  ),
  createToolSchema(
    GetIncidentZodSchema,
    'get_incident',
    'Get an incident from Datadog',
  ),
] as const

type IncidentToolHandlers = ToolHandlers<IncidentToolName>

export const createIncidentToolHandlers = (
  apiInstance: v2.IncidentsApi,
): IncidentToolHandlers => {
  return {
    list_incidents: async (request) => {
      const { pageSize, pageOffset } = ListIncidentsZodSchema.parse(
        request.params.arguments,
      )

      const response = await apiInstance.listIncidents({
        pageSize,
        pageOffset,
      })

      if (response.data == null) {
        throw new Error('No incidents data returned')
      }

      return McpResponse.multiText(response.data, 'Listed incidents:')
    },
    get_incident: async (request) => {
      const { incidentId } = GetIncidentZodSchema.parse(
        request.params.arguments,
      )

      const response = await apiInstance.getIncident({
        incidentId,
      })

      if (response.data == null) {
        throw new Error('No incident data returned')
      }

      return McpResponse.fromApiData(response.data, 'Incident:')
    },
  }
}
