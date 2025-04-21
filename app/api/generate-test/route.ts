import { NextResponse } from "next/server"
import { generateTestWithAI } from "@/lib/services/ai-test-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.discipline || !body.category) {
      return NextResponse.json({ error: "Missing required fields: discipline and category" }, { status: 400 })
    }

    // Generate test with AI
    const result = await generateTestWithAI(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating test:", error)
    return NextResponse.json({ error: error.message || "Failed to generate test" }, { status: 500 })
  }
}
