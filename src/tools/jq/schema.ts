import { z } from 'zod'

export const ExecuteJqQueryZodSchema = z.object({
  jq_query: z
    .string()
    .describe(
      'The jq query to execute on the JSON file. Query will be sanitized to prevent environment variable access.',
    ),
  file_path: z
    .string()
    .describe(
      'Absolute path starting with "/" pointing to the JSON file to process. Must be a valid, existing file with .json extension. The file will be validated for existence and readability before processing.',
    ),
  description: z
    .string()
    .optional()
    .describe(
      'Optional description; a short explanation of the purpose of the query',
    ),
})
