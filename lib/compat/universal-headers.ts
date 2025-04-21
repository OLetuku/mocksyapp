// Universal headers compatibility layer
// Works in both client and server, App Router and Pages Router

import type { NextApiRequest } from "next"

// Safe alternative to headers() from next/headers
export function getCompatHeaders(req?: NextApiRequest) {
  // If we're in a browser environment, return empty headers
  if (typeof window !== "undefined") {
    return new Map()
  }

  // If we have a request object (Pages API routes), use it
  if (req) {
    const headers = new Map()
    Object.entries(req.headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers.set(key, value)
      } else if (Array.isArray(value)) {
        headers.set(key, value.join(", "))
      }
    })
    return headers
  }

  // Try to use App Router headers() if available
  try {
    // Only attempt to use headers() in a server context
    if (typeof window === "undefined") {
      // Use dynamic import to prevent build errors
      const headersModule = require("next/headers")
      return headersModule.headers()
    }
  } catch (e) {
    console.warn("Failed to import next/headers:", e)
  }

  // Fallback to empty headers
  return new Map()
}

// Safe alternative to cookies() from next/headers
export function getCompatCookies(req?: NextApiRequest) {
  // If we're in a browser environment, return empty cookies
  if (typeof window !== "undefined") {
    return {
      get: () => undefined,
      getAll: () => [],
    }
  }

  // If we have a request object (Pages API routes), use it
  if (req) {
    const cookies = new Map()
    const cookieHeader = req.headers.cookie
    if (cookieHeader) {
      cookieHeader.split(";").forEach((cookie) => {
        const [name, ...rest] = cookie.trim().split("=")
        cookies.set(name, rest.join("="))
      })
    }

    return {
      get: (name: string) => (cookies.has(name) ? { name, value: cookies.get(name) } : undefined),
      getAll: () => Array.from(cookies.entries()).map(([name, value]) => ({ name, value })),
    }
  }

  // Try to use App Router cookies() if available
  try {
    // Only attempt to use cookies() in a server context
    if (typeof window === "undefined") {
      // Use dynamic import to prevent build errors
      const cookiesModule = require("next/headers")
      return cookiesModule.cookies()
    }
  } catch (e) {
    console.warn("Failed to import next/cookies:", e)
  }

  // Fallback to empty cookies
  return {
    get: () => undefined,
    getAll: () => [],
  }
}
