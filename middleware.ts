import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // This refreshes the session if needed
  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
