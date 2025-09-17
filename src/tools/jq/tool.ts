import { ExtendedTool, ToolHandlers } from '../../utils/types'
import { createToolSchema } from '../../utils/tool'
import { ExecuteJqQueryZodSchema } from './schema'
import { spawn } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'

type JqToolName = 'execute_jq_query'
type JqTool = ExtendedTool<JqToolName>

export const JQ_TOOLS: JqTool[] = [
  createToolSchema(
    ExecuteJqQueryZodSchema,
    'execute_jq_query',
    'Execute a jq query on a JSON file. ' +
      'This tool processes JSON files using jq operations for data extraction, transformation, and filtering. ' +
      'Supports all standard jq operations including filtering (.field), mapping (.[] | .field), selection (select()), and transformations. ' +
      'Examples: ".users[].name" to extract user names, ".data | length" to count items, ".[].status | select(. == \\"active\\")" to filter by status.',
  ),
] as const

type JqToolHandlers = ToolHandlers<JqToolName>

export const createJqToolHandlers = (): JqToolHandlers => {
  return {
    execute_jq_query: async (request) => {
      const { jq_query, file_path } = ExecuteJqQueryZodSchema.parse(
        request.params.arguments,
      )

      // Input validation
      if (!jq_query || !file_path) {
        throw new Error('jq_query and file_path are required')
      }

      // Sanitize jq query to prevent environment variable access
      const dangerousPatterns = [
        /\$ENV/i, // $ENV variable access
        /env\./i, // env.VARIABLE access
        /@env/i, // @env function
        /\.env\[/i, // .env["VARIABLE"] access
        /getenv/i, // getenv function
        /\$__loc__/i, // location info that might leak paths
        /input_filename/i, // input filename access
      ]

      const isDangerous = dangerousPatterns.some((pattern) =>
        pattern.test(jq_query),
      )
      if (isDangerous) {
        throw new Error(
          'The jq query contains patterns that could access environment variables or system information. Please use a different query.',
        )
      }

      // Validate file path
      if (!path.isAbsolute(file_path)) {
        throw new Error(
          `File path must be an absolute path starting with "/": ${file_path}`,
        )
      }

      if (!existsSync(file_path)) {
        throw new Error(`File not found: ${file_path}`)
      }

      // Validate file extension
      if (!file_path.toLowerCase().endsWith('.json')) {
        throw new Error(
          `Only JSON files (.json) are supported for jq processing: ${file_path}`,
        )
      }

      // Execute jq query
      return new Promise((resolve, reject) => {
        const jqProcess = spawn('jq', [jq_query, file_path], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 30000, // 30 second timeout
        })

        let stdout = ''
        let stderr = ''

        jqProcess.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        jqProcess.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        jqProcess.on('close', (code) => {
          if (code === 0) {
            // Success - return clean response directly to AI
            const responseText = stdout.trim()

            resolve({
              content: [
                {
                  type: 'text',
                  text: responseText,
                },
              ],
            })
          } else {
            // Error
            reject(
              new Error(
                `jq command failed with exit code ${code}: ${stderr.trim()}`,
              ),
            )
          }
        })

        jqProcess.on('error', (error) => {
          reject(new Error(`Failed to execute jq command: ${error.message}`))
        })

        // Handle timeout
        setTimeout(() => {
          if (!jqProcess.killed) {
            jqProcess.kill('SIGTERM')
            reject(new Error('jq command timed out after 30 seconds'))
          }
        }, 30000)
      })
    },
  }
}
