import { type NextRequest, NextResponse } from "next/server"
import { inviteCandidate } from "@/lib/services/candidate-service"
import { createClient } from "@/lib/supabase/server"
import { sendInvitationEmail } from "@/lib/services/email-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { testId, emails, message, deadline, companyDescription, companyIndustry, companyLogo } = body

    if (!testId || !emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Get test details for the email
    const { data: test } = await supabase.from("tests").select("title, role, total_time").eq("id", testId).single()

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Get sender details from user metadata
    const senderName = session.user.user_metadata?.full_name || "The Hiring Team"
    const senderEmail = session.user.email
    const companyName = session.user.user_metadata?.company_name || "Mocksy"
    const jobTitle = session.user.user_metadata?.job_title || "Hiring Manager"

    // Invite each candidate
    const results = await Promise.all(
      emails.map(async (email) => {
        try {
          // Create invitation in database
          const invitation = await inviteCandidate(testId, email, deadline)

          // Send email
          if (invitation.success && invitation.token) {
            const emailSent = await sendInvitationEmail({
              to: email,
              subject: `Invitation to take ${test.title} assessment`,
              testTitle: test.title,
              testRole: test.role,
              testDuration: test.total_time,
              invitationToken: invitation.token,
              testId: testId,
              message: message,
              senderName,
              senderEmail,
              companyName,
              companyDescription: companyDescription || session.user.user_metadata?.company_description,
              companyIndustry: companyIndustry || session.user.user_metadata?.company_industry,
              companyLogo: companyLogo || session.user.user_metadata?.company_logo_url,
              jobTitle,
              deadline,
            })

            return {
              email,
              success: true,
              token: invitation.token,
              emailSent,
            }
          }

          return { email, success: true, emailSent: false }
        } catch (error) {
          console.error(`Error inviting ${email}:`, error)
          return { email, success: false, error: error.message }
        }
      }),
    )

    const successful = results.filter((result) => result.success)
    const failed = results.filter((result) => !result.success)

    return NextResponse.json({
      success: true,
      invited: successful.length,
      failed: failed.length,
      results,
    })
  } catch (error) {
    console.error("Error in invitation API:", error)
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 })
  }
}
