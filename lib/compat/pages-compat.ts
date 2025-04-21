// Compatibility layer for pages/ directory
// This file provides alternatives to next/headers and other server-only imports

import type { NextApiRequest } from "next"

// Safe alternative to next/headers for Pages Router
export function getPagesHeaders(req: NextApiRequest) {
  const headers = new Map()

  // Convert request headers to a Map-like interface
  Object.entries(req.headers).forEach(([key, value]) => {
    if (typeof value === "string") {
      headers.set(key, value)
    } else if (Array.isArray(value)) {
      headers.set(key, value.join(", "))
    }
  })

  return {
    get: (name: string) => headers.get(name.toLowerCase()) || null,
    has: (name: string) => headers.has(name.toLowerCase()),
    entries: () => headers.entries(),
    forEach: (callback: any) => headers.forEach(callback),
  }
}

// Safe alternative to cookies() from next/headers
export function getPagesCookies(req: NextApiRequest) {
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
