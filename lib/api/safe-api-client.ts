// This file provides a safe API client that works in both client and server contexts

// Type for API response
type ApiResponse<T> = {
  data?: T
  error?: string
}

// Safe fetch function that works in both client and server
export async function safeFetch<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    // Use native fetch which works in both environments
    const response = await fetch(url, {
      ...options,
      // Add cache control headers to prevent caching issues
      headers: {
        ...options?.headers,
        "Cache-Control": "no-store",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        error: errorData.error || `API error: ${response.status} ${response.statusText}`,
      }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    console.error("API request failed:", error)
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// POST helper
export async function safePost<T, D = any>(
  url: string,
  data: D,
  options?: Omit<RequestInit, "method" | "body">,
): Promise<ApiResponse<T>> {
  return safeFetch<T>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: JSON.stringify(data),
    ...options,
  })
}

// GET helper
export async function safeGet<T>(url: string, options?: Omit<RequestInit, "method">): Promise<ApiResponse<T>> {
  return safeFetch<T>(url, {
    method: "GET",
    ...options,
  })
}
