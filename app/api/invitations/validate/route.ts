import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Missing token parameter" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Query the invitations table
    const { data, error } = await supabase.from("invitations").select("*, tests(*)").eq("token", token).single()

    if (error) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error validating invitation token:", error)
    return NextResponse.json({ error: "Failed to validate invitation token" }, { status: 500 })
  }
}
