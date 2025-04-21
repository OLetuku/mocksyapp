// This file provides a safe way to access headers in both client and server components

// For server components
export function getHeadersServer() {
  // Only import headers in a server context
  if (typeof window === "undefined") {
    // Dynamic import to prevent build errors
    const { headers } = require("next/headers")
    return headers()
  }
  return null
}

// For client components - fallback implementation
export function getHeadersClient() {
  // Client-side implementation that doesn't rely on next/headers
  if (typeof window !== "undefined") {
    const headerObj = {}
    // You can add any specific headers you need to access client-side
    return headerObj
  }
  return null
}

// Helper to safely get a specific header value
export function getHeaderValue(name: string): string | null {
  if (typeof window === "undefined") {
    // Server-side
    try {
      const { headers } = require("next/headers")
      return headers().get(name)
    } catch (e) {
      console.error("Error accessing headers:", e)
      return null
    }
  } else {
    // Client-side fallback
    return null
  }
}
