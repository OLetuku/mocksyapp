// Utility to detect which router we're using

// Check if we're in the Pages Router
export function isUsingPagesRouter(): boolean {
  // In a browser environment
  if (typeof window !== "undefined") {
    // Check for Next.js data attributes that are specific to App Router
    const appRouterElement = document.querySelector('[data-nextjs-router="app"]')
    if (appRouterElement) {
      return false // App Router detected
    }

    // If we can't definitively detect App Router, assume Pages Router for safety
    return true
  }

  // In a server environment, we need to be more careful
  try {
    // Try to require a module that only exists in App Router
    require("next/navigation")
    // If we get here, we're likely in App Router
    return false
  } catch (e) {
    // If the module doesn't exist, we're likely in Pages Router
    return true
  }
}

// Safe import for navigation
export function getSafeNavigation() {
  if (typeof window !== "undefined") {
    // Client-side
    return {
      useRouter: () => {
        let useRouterImpl
        try {
          useRouterImpl = require("next/navigation").useRouter
        } catch (e) {
          useRouterImpl = require("next/router").useRouter
        }
        return useRouterImpl()
      },
    }
  }

  // Server-side - return dummy implementations
  return {
    useRouter: () => ({
      push: () => {},
      replace: () => {},
      back: () => {},
      pathname: "",
      query: {},
    }),
  }
}
