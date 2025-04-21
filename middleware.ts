import { NextResponse } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req) {
  const res = NextResponse.next()

  // Create a Supabase client for auth
  const supabase = createMiddlewareClient({ req, res })

  // This refreshes the session if needed
  await supabase.auth.getSession()

  return res
}

// This config works for both App Router and Pages Router
export const config = {
  matcher: [
    // Match all dashboard routes in both App Router and Pages Router
    "/dashboard/:path*",
    // Match API routes that need auth
    "/api/auth/:path*",
    "/api/tests/:path*",
    "/api/invitations/:path*",
  ],
}
