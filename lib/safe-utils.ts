/**
 * Utility functions for safe data handling
 */

export function ensureArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[]
  }
  return []
}

export function safeMap<T, R>(array: unknown, callback: (item: T, index: number) => R): R[] {
  const safeArray = ensureArray<T>(array)
  return safeArray.map(callback)
}

export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  if (!obj || typeof obj !== "object") {
    return defaultValue
  }

  const keys = path.split(".")
  let current = obj

  for (const key of keys) {
    if (current[key] === undefined || current[key] === null) {
      return defaultValue
    }
    current = current[key]
  }

  return current as T
}

export function safeString(value: unknown, defaultValue = ""): string {
  if (typeof value === "string") {
    return value
  }
  if (typeof value === "number") {
    return String(value)
  }
  return defaultValue
}

export function safeNumber(value: unknown, defaultValue = 0): number {
  if (typeof value === "number" && !isNaN(value)) {
    return value
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }
  return defaultValue
}
