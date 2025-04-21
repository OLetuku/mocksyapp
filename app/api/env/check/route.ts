import { NextResponse } from "next/server"

export async function GET() {
  // List of required environment variables for email
  const requiredVariables = [
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_SECURE",
    "EMAIL_USER",
    "EMAIL_PASSWORD",
    "EMAIL_FROM",
    "NEXT_PUBLIC_APP_URL",
  ]

  // Check which variables are available
  const available = []
  const missing = []

  for (const variable of requiredVariables) {
    if (process.env[variable]) {
      available.push(variable)
    } else {
      missing.push(variable)
    }
  }

  // Determine if email is configured
  const configured = missing.length === 0

  return NextResponse.json({
    configured,
    missing,
    available,
  })
}
