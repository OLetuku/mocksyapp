import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error("Error exchanging code for session:", error)
      // Redirect to login with error
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent("Failed to verify email. Please try again.")}`,
      )
    }
  }

  // Redirect to the dashboard or home page after successful verification
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
