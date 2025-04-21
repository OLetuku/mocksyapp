import { createServerClient as createSupabaseServerClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"
import type { NextApiRequest, NextApiResponse } from "next"

// Create a Supabase client for Pages Router API routes
export function createPagesServerClient(req: NextApiRequest, res: NextApiResponse) {
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    },
  )
}

// For pages that need to access cookies
export function createPagesAuthClient(req: NextApiRequest, res: NextApiResponse) {
  // Get cookies from the request
  const getCookie = (name: string) => {
    const cookies = req.headers.cookie?.split(";").map((c) => c.trim())
    if (!cookies) return undefined

    const cookie = cookies.find((c) => c.startsWith(`${name}=`))
    return cookie ? cookie.split("=")[1] : undefined
  }

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          // Pass auth cookie if it exists
          cookie: req.headers.cookie || "",
        },
      },
    },
  )
}
