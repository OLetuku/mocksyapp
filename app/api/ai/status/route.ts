import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_API_KEY
    const isConfigured = !!apiKey

    return NextResponse.json({
      provider: "Google Gemini",
      model: "gemini-1.5-pro",
      configured: isConfigured,
      status: isConfigured ? "ready" : "not configured",
    })
  } catch (error) {
    console.error("Error checking AI status:", error)
    return NextResponse.json({ error: "Failed to check AI status" }, { status: 500 })
  }
}
