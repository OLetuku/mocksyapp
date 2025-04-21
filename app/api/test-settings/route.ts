import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()
    const { test_id, watermark, prevent_skipping, limit_attempts } = body

    if (!test_id) {
      return NextResponse.json({ error: "Missing test_id" }, { status: 400 })
    }

    // Verify that the test belongs to the current user
    const { data: test, error: testError } = await supabase
      .from("tests")
      .select("id")
      .eq("id", test_id)
      .eq("created_by", session.user.id)
      .single()

    if (testError || !test) {
      return NextResponse.json({ error: "Test not found or access denied" }, { status: 404 })
    }

    // Create the test settings using the server client
    // This bypasses RLS since the server client has admin privileges
    const { error: settingsError } = await supabase.from("test_settings").insert({
      test_id,
      watermark: watermark ?? false,
      prevent_skipping: prevent_skipping ?? true,
      limit_attempts: limit_attempts ?? true,
    })

    if (settingsError) {
      console.error("Settings creation error:", settingsError)
      return NextResponse.json({ error: `Failed to create test settings: ${settingsError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in test settings API:", error)
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient()

    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()
    const { test_id, watermark, prevent_skipping, limit_attempts } = body

    if (!test_id) {
      return NextResponse.json({ error: "Missing test_id" }, { status: 400 })
    }

    // Verify that the test belongs to the current user
    const { data: test, error: testError } = await supabase
      .from("tests")
      .select("id")
      .eq("id", test_id)
      .eq("created_by", session.user.id)
      .single()

    if (testError || !test) {
      return NextResponse.json({ error: "Test not found or access denied" }, { status: 404 })
    }

    // Update the test settings using the server client
    const { error: settingsError } = await supabase.from("test_settings").upsert({
      test_id,
      watermark: watermark ?? false,
      prevent_skipping: prevent_skipping ?? true,
      limit_attempts: limit_attempts ?? true,
      updated_at: new Date().toISOString(),
    })

    if (settingsError) {
      console.error("Settings update error:", settingsError)
      return NextResponse.json({ error: `Failed to update test settings: ${settingsError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in test settings API:", error)
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 })
  }
}
