import { createClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import type { Database } from "@/lib/supabase/database.types"

type Candidate = Database["public"]["Tables"]["candidates"]["Row"]
type Test = Database["public"]["Tables"]["tests"]["Row"]

// Function to invite a candidate to a test
export async function inviteCandidate(testId: string, email: string, deadline?: string | null) {
  try {
    const supabase = createClient()

    // Check if candidate exists
    let { data: candidate } = await supabase.from("candidates").select("id").eq("email", email).single()

    // Create candidate if not exists
    if (!candidate) {
      const { data: newCandidate, error: candidateError } = await supabase
        .from("candidates")
        .insert({
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (candidateError) throw candidateError
      candidate = newCandidate
    }

    // Generate invitation token
    const token = uuidv4()

    // Set expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Create invitation
    const { error: invitationError } = await supabase.from("invitations").insert({
      test_id: testId,
      candidate_id: candidate.id,
      email,
      status: "pending",
      token,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deadline: deadline || null,
    })

    if (invitationError) throw invitationError

    return { success: true, token }
  } catch (error) {
    console.error("Error inviting candidate:", error)
    return { success: false, error: error.message }
  }
}

// Function to get all candidates for a test
export async function getCandidatesForTest(testId: string) {
  try {
    const supabase = createClient()

    // Get all invitations for the test
    const { data: invitations, error: invitationsError } = await supabase
      .from("invitations")
      .select("*, candidates(*)")
      .eq("test_id", testId)
      .order("created_at", { ascending: false })

    if (invitationsError) throw invitationsError

    // Get all submissions for the test
    const { data: submissions, error: submissionsError } = await supabase
      .from("test_submissions")
      .select("*, candidates(*)")
      .eq("test_id", testId)
      .order("created_at", { ascending: false })

    if (submissionsError) throw submissionsError

    // Combine and format the data
    const candidates = invitations.map((invitation) => {
      const submission = submissions.find((sub) => sub.candidate_id === invitation.candidate_id)

      return {
        id: invitation.candidate_id,
        email: invitation.email,
        name: invitation.candidates?.name || null,
        invitedAt: invitation.created_at,
        status: submission ? submission.status : "invited",
        submissionId: submission?.id || null,
        startedAt: submission?.started_at || null,
        completedAt: submission?.completed_at || null,
        deadline: invitation.deadline || null,
      }
    })

    return { success: true, candidates }
  } catch (error) {
    console.error("Error getting candidates:", error)
    return { success: false, error: error.message }
  }
}

// Function to validate an invitation token
export async function validateInvitation(testId: string, token: string) {
  try {
    const supabase = createClient()

    // Get the invitation
    const { data: invitation, error } = await supabase
      .from("invitations")
      .select("*, candidates(*)")
      .eq("test_id", testId)
      .eq("token", token)
      .single()

    if (error) throw error

    // Check if invitation is expired
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)

    if (now > expiresAt) {
      return {
        valid: false,
        error: "Invitation has expired",
        candidate: null,
      }
    }

    // Check if there's a deadline and it has passed
    if (invitation.deadline) {
      const deadline = new Date(invitation.deadline)
      if (now > deadline) {
        return {
          valid: false,
          error: "The deadline for this assessment has passed",
          candidate: null,
        }
      }
    }

    return {
      valid: true,
      candidate: {
        id: invitation.candidate_id,
        email: invitation.email,
        name: invitation.candidates?.name,
      },
    }
  } catch (error) {
    console.error("Error validating invitation:", error)
    return { valid: false, error: error.message, candidate: null }
  }
}

// Add this function after the validateInvitation function
export async function validateInvitationToken(token: string): Promise<{
  valid: boolean
  test?: Test
  candidate?: Candidate
  error?: string
}> {
  try {
    const supabase = createClient()

    // First, find the invitation with this token
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
      .single()

    if (invitationError || !invitation) {
      return {
        valid: false,
        error: "Invalid invitation token",
      }
    }

    // Check if the invitation has expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return {
        valid: false,
        error: "Invitation has expired",
      }
    }

    // Get the test information
    const { data: test, error: testError } = await supabase
      .from("tests")
      .select("*")
      .eq("id", invitation.test_id)
      .single()

    if (testError || !test) {
      return {
        valid: false,
        error: "Test not found",
      }
    }

    // Get the candidate information
    const { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", invitation.candidate_id)
      .single()

    if (candidateError || !candidate) {
      return {
        valid: false,
        error: "Candidate not found",
      }
    }

    return {
      valid: true,
      test,
      candidate,
    }
  } catch (error) {
    console.error("Error validating invitation token:", error)
    return {
      valid: false,
      error: "Failed to validate invitation token",
    }
  }
}

// Function to validate a candidate's email for a test
export async function validateCandidateEmail(testId: string, email: string) {
  try {
    const supabase = createClient()

    // Check if there's an invitation for this email
    const { data: invitation, error } = await supabase
      .from("invitations")
      .select("token, expires_at, deadline")
      .eq("test_id", testId)
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // If no invitation found, return invalid
      return { valid: false, token: null }
    }

    // Check if invitation is expired
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)

    if (now > expiresAt) {
      return { valid: false, token: null, error: "Invitation has expired" }
    }

    // Check if there's a deadline and it has passed
    if (invitation.deadline) {
      const deadline = new Date(invitation.deadline)
      if (now > deadline) {
        return {
          valid: false,
          token: null,
          error: "The deadline for this assessment has passed",
        }
      }
    }

    return { valid: true, token: invitation.token }
  } catch (error) {
    console.error("Error validating candidate email:", error)
    return { valid: false, token: null, error: error.message }
  }
}
