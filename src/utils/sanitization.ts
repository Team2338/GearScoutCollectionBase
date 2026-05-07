/**
 * Input sanitization utilities
 */

/**
 * Sanitize user input by trimming whitespace and removing potentially harmful characters
 * @param input - The raw input string
 * @returns Sanitized string safe for storage and display
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential XSS characters
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // Remove control characters
}

/**
 * Sanitize event code to ensure it follows expected format
 * @param input - The raw event code
 * @returns Sanitized event code (lowercase alphanumeric)
 */
export function sanitizeEventCode(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // Only allow alphanumeric
}
