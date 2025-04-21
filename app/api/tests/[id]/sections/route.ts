import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const testId = params.id

    if (!testId) {
      return NextResponse.json({ error: "Missing test ID" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Query the test sections
    const { data, error } = await supabase.from("test_sections").select("*").eq("test_id", testId).order("index")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch test sections" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching test sections:", error)
    return NextResponse.json({ error: "Failed to fetch test sections" }, { status: 500 })
  }
}
