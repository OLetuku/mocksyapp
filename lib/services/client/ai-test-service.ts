// Client-safe API client
async function apiClient(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API client error:", error)
    throw error
  }
}

// Client-safe version of the AI test service
export const aiTestService = {
  // Generate a test using the API
  generateTest: async (prompt: string) => {
    return apiClient("/api/generate-test", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    })
  },

  // Check AI status using the API
  checkStatus: async () => {
    return apiClient("/api/ai/status")
  },

  // Save a test using the API
  saveTest: async (testData: any) => {
    return apiClient("/api/save-test", {
      method: "POST",
      body: JSON.stringify(testData),
    })
  },
}

// Export a default instance
export default aiTestService
