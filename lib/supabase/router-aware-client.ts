import type { NextApiRequest, NextApiResponse } from "next"
import { createClient as createAppClient } from "./server"
import { createPagesServerClient } from "./pages-client"

// Detect if we're in the App Router or Pages Router
function isAppRouter() {
  try {
    // Try to require a module that only exists in App Router
    require("next/headers")
    return true
  } catch (e) {
    return false
  }
}

// Create the appropriate client based on the router
export function createRouterAwareClient(req?: NextApiRequest, res?: NextApiResponse) {
  // If we have req/res, we're in Pages Router API route
  if (req && res) {
    return createPagesServerClient(req, res)
  }

  // Otherwise, try to use App Router client
  if (isAppRouter()) {
    return createAppClient()
  }

  // Fallback to service role client
  const { createServerClient } = require("./server")
  return createServerClient()
}
