export function stripHtml(input: string): string {
  if (!input) return ''
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim()
}

export function sanitizeString(input: string, maxLength: number = 5000): string {
  if (!input) return ''
  return stripHtml(input).slice(0, maxLength)
}
