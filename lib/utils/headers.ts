// This file provides a safe way to access headers in both client and server components
// and is compatible with both App Router and Pages Router

import { getPagesHeaders, getPagesCookies } from "../compat/pages-compat"
import type { NextApiRequest } from "next"

// For server components in App Router
export function getHeadersServer() {
  // Only import headers in a server context
  if (typeof window === "undefined") {
    try {
      // Dynamic import to prevent build errors
      const { headers } = require("next/headers")
      return headers()
    } catch (e) {
      console.warn("Failed to import next/headers:", e)
      return new Map()
    }
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
      console.warn(`Failed to get header ${name}:`, e)
      return null
    }
  } else {
    // Client-side fallback
    return null
  }
}

// Compatible headers function that works in both App Router and Pages Router
export function getCompatHeaders(req?: NextApiRequest) {
  // If we're passed a request object, we're in Pages Router API
  if (req) {
    return getPagesHeaders(req)
  }

  // Otherwise, try to use App Router headers
  if (typeof window === "undefined") {
    try {
      const { headers } = require("next/headers")
      return headers()
    } catch (e) {
      // If that fails, return an empty headers object
      console.warn("Failed to get headers:", e)
      return new Map()
    }
  }

  // Client-side fallback
  return new Map()
}

// Compatible cookies function that works in both App Router and Pages Router
export function getCompatCookies(req?: NextApiRequest) {
  // If we're passed a request object, we're in Pages Router API
  if (req) {
    return getPagesCookies(req)
  }

  // Otherwise, try to use App Router cookies
  if (typeof window === "undefined") {
    try {
      const { cookies } = require("next/headers")
      return cookies()
    } catch (e) {
      // If that fails, return an empty cookies object
      console.warn("Failed to get cookies:", e)
      return {
        get: () => undefined,
        getAll: () => [],
      }
    }
  }

  // Client-side fallback
  return {
    get: () => undefined,
    getAll: () => [],
  }
}
