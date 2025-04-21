import { NextResponse } from "next/server"
import { generateTestWithAIServer } from "@/lib/services/server/ai-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.discipline || !body.category) {
      return NextResponse.json({ error: "Missing required fields: discipline and category" }, { status: 400 })
    }

    // Generate test with AI (server-side implementation)
    const result = await generateTestWithAIServer(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating test:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate test" },
      { status: 500 },
    )
  }
}
