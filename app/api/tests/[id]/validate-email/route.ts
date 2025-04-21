import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { email } = body

    if (!email || !id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if there's an invitation for this email and test
    const { data, error } = await supabase
      .from("invitations")
      .select("token, status, expires_at")
      .eq("test_id", id)
      .eq("email", email)
      .single()

    if (error || !data) {
      return NextResponse.json({ valid: false, error: "No invitation found for this email" }, { status: 404 })
    }

    // Check if invitation has expired
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "Invitation has expired" }, { status: 403 })
    }

    // Check if invitation has already been used
    if (data.status === "completed") {
      return NextResponse.json({ valid: false, error: "Invitation has already been used" }, { status: 403 })
    }

    return NextResponse.json({ valid: true, token: data.token })
  } catch (error) {
    console.error("Error validating email:", error)
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 })
  }
}
