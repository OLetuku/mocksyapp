import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

type TestSubmission = Database["public"]["Tables"]["test_submissions"]["Row"]
type SectionSubmission = Database["public"]["Tables"]["section_submissions"]["Row"]

export async function startTest(testId: string, candidateId: string) {
  const supabase = createClient()

  // Check if a submission already exists
  const { data: existingSubmission, error: checkError } = await supabase
    .from("test_submissions")
    .select("id, status")
    .eq("test_id", testId)
    .eq("candidate_id", candidateId)
    .single()

  if (!checkError && existingSubmission) {
    // If the submission exists and is not completed, return it
    if (existingSubmission.status !== "completed") {
      return existingSubmission
    }

    // If the submission is completed, throw an error
    throw new Error("You have already completed this test")
  }

  // Create a new submission
  const { data: submission, error: createError } = await supabase
    .from("test_submissions")
    .insert({
      test_id: testId,
      candidate_id: candidateId,
      status: "in_progress",
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (createError) {
    throw createError
  }

  // Get the test sections
  const { data: sections, error: sectionsError } = await supabase
    .from("test_sections")
    .select("id")
    .eq("test_id", testId)
    .order("order_index", { ascending: true })

  if (sectionsError) {
    throw sectionsError
  }

  // Create section submissions
  const sectionSubmissions = sections.map((section) => ({
    test_submission_id: submission.id,
    section_id: section.id,
    status: "pending",
  }))

  const { error: sectionError } = await supabase.from("section_submissions").insert(sectionSubmissions)

  if (sectionError) {
    throw sectionError
  }

  return submission
}

export async function startSection(submissionId: string, sectionId: string) {
  const supabase = createClient()

  // Update the section submission
  const { data, error } = await supabase
    .from("section_submissions")
    .update({
      status: "in_progress",
      started_at: new Date().toISOString(),
    })
    .eq("test_submission_id", submissionId)
    .eq("section_id", sectionId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function completeSection(
  submissionId: string,
  sectionId: string,
  submissionLink: string,
  comments: string,
  timeSpent: number,
) {
  const supabase = createClient()

  // Update the section submission
  const { data, error } = await supabase
    .from("section_submissions")
    .update({
      status: "completed",
      submission_link: submissionLink,
      comments,
      time_spent: timeSpent,
      completed_at: new Date().toISOString(),
    })
    .eq("test_submission_id", submissionId)
    .eq("section_id", sectionId)
    .select()
    .single()

  if (error) {
    throw error
  }

  // Check if all sections are completed
  const { data: sections, error: sectionsError } = await supabase
    .from("section_submissions")
    .select("status")
    .eq("test_submission_id", submissionId)

  if (sectionsError) {
    throw sectionsError
  }

  const allCompleted = sections.every((section) => section.status === "completed")

  if (allCompleted) {
    // Update the test submission
    const { error: updateError } = await supabase
      .from("test_submissions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", submissionId)

    if (updateError) {
      throw updateError
    }
  }

  return data
}

export async function getSubmissionById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("test_submissions")
    .select(`
      id,
      status,
      started_at,
      completed_at,
      tests (
        id,
        title,
        role,
        total_time
      ),
      candidates (
        id,
        name,
        email
      ),
      section_submissions (
        id,
        status,
        submission_link,
        comments,
        time_spent,
        started_at,
        completed_at,
        test_sections (
          id,
          title,
          type,
          time_limit,
          instructions,
          reference_link,
          download_link,
          output_format,
          order_index
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    throw error
  }

  return data
}
