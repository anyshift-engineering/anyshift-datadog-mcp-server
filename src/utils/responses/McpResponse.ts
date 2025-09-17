import { Result } from '@modelcontextprotocol/sdk/types.js'
import { truncateResponseIfNeeded } from '../truncation'

/**
 * Utility class for creating MCP responses with automatic truncation.
 *
 * Provides consistent response formatting across all tools while managing:
 * - Display text truncation for user-facing content
 * - Raw text preservation for file writing systems
 * - Automatic token limit enforcement
 */
export class McpResponse {
  private displayText: string
  private _rawText: string

  private constructor(displayText: string, rawText: string) {
    this.displayText = displayText
    this._rawText = rawText
  }

  /**
   * Creates a success response with automatic truncation.
   * Display text is truncated if needed, raw text preserved for file writing.
   *
   * @param text - The response content
   * @param prefix - Optional prefix for the display text (e.g., "Listed incidents:")
   * @returns MCP Result with truncated display text and preserved raw text
   */
  static success(text: string, prefix?: string): Result {
    const fullText = prefix ? `${prefix}\n${text}` : text
    const truncatedText = truncateResponseIfNeeded(fullText)

    const response = new McpResponse(truncatedText, fullText)

    return {
      content: [
        {
          type: 'text',
          text: response.displayText,
        },
      ],
      // Store raw text for file writing access
      _rawText: response._rawText,
    } as Result & { _rawText: string }
  }

  /**
   * Creates a success response with explicit raw and display text separation.
   * Useful when you need different content for display vs file writing.
   *
   * @param displayText - Text shown to the user (will be truncated if needed)
   * @param rawText - Full text for file writing (never truncated)
   * @returns MCP Result with separated display and raw text
   */
  static successWithRaw(displayText: string, rawText: string): Result {
    const truncatedDisplayText = truncateResponseIfNeeded(displayText)
    const response = new McpResponse(truncatedDisplayText, rawText)

    return {
      content: [
        {
          type: 'text',
          text: response.displayText,
        },
      ],
      _rawText: response._rawText,
    } as Result & { _rawText: string }
  }

  /**
   * Creates a response from API data with JSON serialization.
   * Commonly used pattern for Datadog API responses.
   *
   * @param data - API response data to serialize
   * @param prefix - Optional prefix for the display text
   * @returns MCP Result with JSON-serialized content
   */
  static fromApiData(data: unknown, prefix?: string): Result {
    const jsonText = JSON.stringify(data, null, 2)
    return McpResponse.success(jsonText, prefix)
  }

  /**
   * Creates a response from multiple API data items.
   * Consolidates array items into a single response with proper formatting.
   *
   * @param items - Array of data items to serialize
   * @param prefix - Optional prefix for the display text
   * @returns MCP Result with consolidated multi-item content
   */
  static multiText(items: unknown[], prefix?: string): Result {
    const combinedText = items
      .map((item) => JSON.stringify(item, null, 2))
      .join('\n\n')

    return McpResponse.success(combinedText, prefix)
  }

  /**
   * Creates an error response (no truncation applied to error messages)
   *
   * @param message - Error message
   * @returns MCP Result with error content
   */
  static error(message: string): Result {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${message}`,
        },
      ],
      isError: true,
    }
  }

  /**
   * Extracts raw text from an MCP response for file writing.
   * Used by the file writing system to access untruncated content.
   *
   * @param response - MCP Result that may contain _rawText
   * @returns Raw untruncated text or display text as fallback
   */
  static extractRawText(response: Result & { _rawText?: string }): string {
    if (response._rawText) {
      return response._rawText
    }

    // Fallback to display text if no raw text available
    if (response.content && Array.isArray(response.content)) {
      const textContent = response.content
        .filter((item) => item.type === 'text')
        .map((item) => (item as { text: string }).text)
        .join('\n')
      return textContent
    }

    return ''
  }
}
