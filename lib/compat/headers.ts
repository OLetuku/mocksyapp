// This file provides safe access to headers in any context

// Safe function to get headers that works in both client and server contexts
export function safeGetHeaders() {
  // Only attempt to use next/headers on the server
  if (typeof window === "undefined") {
    try {
      // Dynamic import to prevent build errors
      const headers = require("next/headers").headers
      return headers()
    } catch (e) {
      console.warn("Failed to import next/headers:", e)
      return new Map()
    }
  }
  // Return empty headers on client
  return new Map()
}

// Safe function to get a specific header
export function safeGetHeader(name: string): string | null {
  if (typeof window === "undefined") {
    try {
      const headers = require("next/headers").headers
      return headers().get(name)
    } catch (e) {
      console.warn(`Failed to get header ${name}:`, e)
      return null
    }
  }
  return null
}

// Safe function to get cookies
export function safeGetCookies() {
  if (typeof window === "undefined") {
    try {
      const cookies = require("next/headers").cookies
      return cookies()
    } catch (e) {
      console.warn("Failed to import next/headers cookies:", e)
      return new Map()
    }
  }
  return new Map()
}

// Safe function to get a specific cookie
export function safeGetCookie(name: string): string | null {
  if (typeof window === "undefined") {
    try {
      const cookies = require("next/headers").cookies
      return cookies().get(name)?.value || null
    } catch (e) {
      console.warn(`Failed to get cookie ${name}:`, e)
      return null
    }
  }
  return null
}
