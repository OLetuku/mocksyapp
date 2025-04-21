import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateInvitationToken } from "@/lib/services/candidate-service"
import { getTestSections } from "@/lib/services/test-service"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testId, token } = body

    if (!testId || !token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate token
    const validation = await validateInvitationToken(testId, token)

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 })
    }

    const candidateId = validation.candidateId

    const supabase = createClient()

    // Check if a submission already exists
    const { data: existingSubmission, error: checkError } = await supabase
      .from("test_submissions")
      .select("id, status")
      .eq("test_id", testId)
      .eq("candidate_id", candidateId)
      .single()

    if (!checkError && existingSubmission) {
      // If submission exists and is not completed, return it
      if (existingSubmission.status !== "completed") {
        return NextResponse.json({
          submissionId: existingSubmission.id,
          message: "Resuming existing submission",
        })
      }

      // If completed, don't allow another attempt
      return NextResponse.json(
        {
          error: "You have already completed this test",
        },
        { status: 403 },
      )
    }

    // Create a new submission
    const submissionId = uuidv4()
    const { error: createError } = await supabase.from("test_submissions").insert({
      id: submissionId,
      test_id: testId,
      candidate_id: candidateId,
      status: "in_progress",
      started_at: new Date().toISOString(),
    })

    if (createError) {
      throw createError
    }

    // Update invitation status
    await supabase
      .from("invitations")
      .update({ status: "accepted" })
      .eq("test_id", testId)
      .eq("candidate_id", candidateId)

    // Get test sections to create section submissions
    const sections = await getTestSections(testId)

    // Create section submissions
    for (const section of sections) {
      await supabase.from("section_submissions").insert({
        test_submission_id: submissionId,
        section_id: section.id,
        status: "pending",
        time_spent: 0,
      })
    }

    return NextResponse.json({
      submissionId,
      message: "Test submission created successfully",
    })
  } catch (error) {
    console.error("Error creating test submission:", error)
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 })
  }
}
