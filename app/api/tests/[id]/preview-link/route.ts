import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the test and ensure the user owns it
    const { data: test, error } = await supabase
      .from("tests")
      .select("id, preview_token")
      .eq("id", params.id)
      .eq("created_by", user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to fetch test" }, { status: 500 })
    }

    // If preview_token is null, generate a new one
    if (!test.preview_token) {
      const newToken = crypto.randomUUID()
      const { error: updateError } = await supabase
        .from("tests")
        .update({ preview_token: newToken })
        .eq("id", params.id)
        .eq("created_by", user.id)

      if (updateError) {
        return NextResponse.json({ error: "Failed to generate preview link" }, { status: 500 })
      }

      return NextResponse.json({ previewToken: newToken })
    }

    return NextResponse.json({ previewToken: test.preview_token })
  } catch (error) {
    console.error("Error in preview link API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
