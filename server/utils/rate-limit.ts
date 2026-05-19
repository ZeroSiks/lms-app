import type { H3Event } from 'h3'

interface RateEntry {
  count: number
  resetAt: number
}

const store = new Map<string, { count: number; resetAt: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 60_000)

export function rateLimit(event: H3Event, maxRequests: number = 5, windowMs: number = 60_000): void {
  if (process.env.NODE_ENV !== 'production') return

  const ip = getRequestIP(event) ?? 'unknown'
  const key = `${ip}:${event.path}`

  const existing = store.get(key)
  const now = Date.now()

  if (existing && now > existing.resetAt) {
    store.delete(key)
  }

  const entry: RateEntry = store.get(key) ?? { count: 0, resetAt: now + windowMs }

  entry.count++

  if (entry.count > maxRequests) {
    throw createError({ statusCode: 429, message: 'Too many requests. Please try again later.' })
  }

  store.set(key, entry)
}
