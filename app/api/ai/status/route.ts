import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_API_KEY

    return NextResponse.json({
      configured: !!apiKey,
      provider: "Google",
      model: "Gemini 1.5 Pro",
    })
  } catch (error) {
    console.error("Error checking AI status:", error)
    return NextResponse.json({ error: "Failed to check AI status" }, { status: 500 })
  }
}
