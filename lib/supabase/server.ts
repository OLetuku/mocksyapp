import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Create a Supabase client for server-side use with service role
// This doesn't use next/headers so it's safe everywhere
export function createServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey)
}

// This function is only for App Router server components
// It uses next/headers which is only available in App Router
export const createClient = () => {
  // Only import and use cookies() in a server context within App Router
  if (typeof window === "undefined") {
    try {
      // Dynamic imports to prevent build errors
      const { cookies } = require("next/headers")
      const { createServerComponentClient } = require("@supabase/auth-helpers-nextjs")

      const cookieStore = cookies()
      return createServerComponentClient<Database>({
        cookies: () => cookieStore,
      })
    } catch (error) {
      console.error("Error creating Supabase client with cookies:", error)
      // Fallback to non-cookie client if we're in a context where cookies() isn't available
      return createServerClient()
    }
  }

  // This should never be called client-side, but just in case
  throw new Error("createClient() should only be called in server components")
}
