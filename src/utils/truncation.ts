const MAX_TOKEN_LIMIT = 20000

/**
 * Truncates response content if it exceeds the token limit to prevent context overflow.
 * Uses a simple token estimation of chars/4 for efficiency.
 *
 * @param content - The response content to potentially truncate
 * @returns The original content if under limit, or truncated content with notice
 */
export function truncateResponseIfNeeded(content: string): string {
  const estimatedTokens = Math.ceil(content.length / 4)

  if (estimatedTokens <= MAX_TOKEN_LIMIT) {
    return content
  }

  const maxChars = MAX_TOKEN_LIMIT * 4
  const truncatedContent = content.slice(0, maxChars)

  const truncationNotice = `

=== RESPONSE TRUNCATED ===
Estimated tokens: ${estimatedTokens} (limit: ${MAX_TOKEN_LIMIT})
Response truncated to prevent context overflow.
Please refine your query to be more specific and fetch less data.
=== END TRUNCATION NOTICE ===`

  return truncatedContent + truncationNotice
}

/**
 * Gets the estimated token count for content using chars/4 estimation
 */
export function getEstimatedTokenCount(content: string): number {
  return Math.ceil(content.length / 4)
}

/**
 * Checks if content would be truncated without actually truncating it
 */
export function wouldBeTruncated(content: string): boolean {
  return getEstimatedTokenCount(content) > MAX_TOKEN_LIMIT
}

export { MAX_TOKEN_LIMIT }
