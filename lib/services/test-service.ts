import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

type Test = Database["public"]["Tables"]["tests"]["Row"]
type TestSection = Database["public"]["Tables"]["test_sections"]["Row"]
type TestSettings = Database["public"]["Tables"]["test_settings"]["Row"]

// Add this function at the top of the file
async function getUserOrThrow(supabase) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error("Error getting user:", userError)
    throw new Error(`Authentication error: ${userError.message}`)
  }

  if (!user) {
    throw new Error("User not authenticated")
  }

  return user
}

export async function createTest(
  title: string,
  discipline: string,
  category: string,
  sections: Array<{
    title: string
    type: string
    timeLimit: number
    instructions: string
    referenceLink: string
    downloadLink: string
    outputFormat: string
    submissionType: string
  }>,
  settings: {
    watermark: boolean
    preventSkipping: boolean
    limitAttempts: boolean
  },
  aiGenerated = false,
) {
  const supabase = createClient()

  try {
    // Get the current user
    const user = await getUserOrThrow(supabase)

    // Calculate total time
    const totalTime = sections.reduce((total, section) => total + section.timeLimit, 0)

    try {
      // Start a transaction by using a single batch operation
      // 1. Create the test
      const { data: test, error: testError } = await supabase
        .from("tests")
        .insert({
          title,
          discipline,
          category,
          created_by: user.id,
          total_time: totalTime,
          ai_generated: aiGenerated,
        })
        .select()
        .single()

      if (testError) {
        console.error("Test creation error:", testError)
        throw new Error(`Failed to create test: ${testError.message}`)
      }

      if (!test || !test.id) {
        throw new Error("Test was created but no ID was returned")
      }

      // 2. Create test sections
      const sectionsToInsert = sections.map((section, index) => ({
        test_id: test.id,
        title: section.title || `${section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section`,
        type: section.type,
        time_limit: section.timeLimit,
        instructions: section.instructions,
        reference_link: section.referenceLink,
        download_link: section.downloadLink,
        output_format: section.outputFormat,
        submission_type: section.submissionType,
        order_index: index,
      }))

      const { error: sectionsError } = await supabase.from("test_sections").insert(sectionsToInsert)

      if (sectionsError) {
        console.error("Sections creation error:", sectionsError)
        // If there's an error, try to clean up the test
        await supabase.from("tests").delete().eq("id", test.id)
        throw new Error(`Failed to create test sections: ${sectionsError.message}`)
      }

      // 3. Create test settings - use a server-side API endpoint instead of direct insertion
      try {
        // Create a server-side API endpoint to handle this operation
        const response = await fetch("/api/test-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            test_id: test.id,
            watermark: settings.watermark,
            prevent_skipping: settings.preventSkipping,
            limit_attempts: settings.limitAttempts,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create test settings")
        }
      } catch (settingsError) {
        console.error("Settings creation error:", settingsError)
        // If there's an error, try to clean up the test and sections
        await supabase.from("tests").delete().eq("id", test.id)
        throw new Error(`Failed to create test settings: ${settingsError.message}`)
      }

      return test
    } catch (error) {
      console.error("Test creation process error:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in createTest:", error)
    throw error
  }
}

export async function getTests() {
  const supabase = createClient()

  try {
    // Get the current user
    const user = await getUserOrThrow(supabase)
    console.log("Fetching tests for user ID:", user.id)

    const { data: tests, error } = await supabase
      .from("tests")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tests:", error)
      throw new Error(`Failed to fetch tests: ${error.message}`)
    }

    return tests || []
  } catch (error) {
    console.error("Error in getTests:", error)
    throw error
  }
}

export async function getTestById(id: string) {
  const supabase = createClient()

  try {
    // Get the current user
    const user = await getUserOrThrow(supabase)

    // Get the test
    const { data: test, error: testError } = await supabase
      .from("tests")
      .select("*")
      .eq("id", id)
      .eq("created_by", user.id)
      .single()

    if (testError) {
      console.error("Error fetching test:", testError)
      throw new Error(`Failed to fetch test: ${testError.message}`)
    }

    // Get the test sections
    const { data: sections, error: sectionsError } = await supabase
      .from("test_sections")
      .select("*")
      .eq("test_id", id)
      .order("order_index", { ascending: true })

    if (sectionsError) {
      console.error("Error fetching test sections:", sectionsError)
      throw new Error(`Failed to fetch test sections: ${sectionsError.message}`)
    }

    // Get the test settings
    const { data: settings, error: settingsError } = await supabase
      .from("test_settings")
      .select("*")
      .eq("test_id", id)
      .single()

    if (settingsError) {
      console.error("Error fetching test settings:", settingsError)
      throw new Error(`Failed to fetch test settings: ${settingsError.message}`)
    }

    return {
      test,
      sections,
      settings,
    }
  } catch (error) {
    console.error("Error in getTestById:", error)
    throw error
  }
}

// Add this function after the getTestById function
export async function getTestSections(testId: string) {
  const supabase = createClient()

  try {
    // Get the test sections
    const { data: sections, error: sectionsError } = await supabase
      .from("test_sections")
      .select("*")
      .eq("test_id", testId)
      .order("order_index", { ascending: true })

    if (sectionsError) {
      console.error("Error fetching test sections:", sectionsError)
      throw new Error(`Failed to fetch test sections: ${sectionsError.message}`)
    }

    return sections || []
  } catch (error) {
    console.error("Error in getTestSections:", error)
    throw error
  }
}

export async function updateTest(testId: string, testData: any) {
  try {
    const supabase = createClient()

    // Update the test
    const { error: testError } = await supabase
      .from("tests")
      .update({
        title: testData.title,
        role: testData.role,
        total_time: testData.total_time,
        updated_at: new Date().toISOString(),
      })
      .eq("id", testId)

    if (testError) throw testError

    // Handle sections
    for (const section of testData.sections) {
      if (section.id && section.id.startsWith("new-section-")) {
        // This is a new section, create it
        const { error: newSectionError } = await supabase.from("test_sections").insert({
          test_id: testId,
          title: section.title,
          type: section.type,
          time_limit: section.time_limit,
          instructions: section.instructions,
          reference_link: section.reference_link,
          download_link: section.download_link,
          output_format: section.output_format,
        })

        if (newSectionError) throw newSectionError
      } else {
        // Update existing section
        const { error: updateSectionError } = await supabase
          .from("test_sections")
          .update({
            title: section.title,
            type: section.type,
            time_limit: section.time_limit,
            instructions: section.instructions,
            reference_link: section.reference_link,
            download_link: section.download_link,
            output_format: section.output_format,
            updated_at: new Date().toISOString(),
          })
          .eq("id", section.id)

        if (updateSectionError) throw updateSectionError
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating test:", error)
    throw new Error("Failed to update test")
  }
}

export async function deleteTest(id: string) {
  const supabase = createClient()

  try {
    // Get the current user
    const user = await getUserOrThrow(supabase)

    const { error } = await supabase.from("tests").delete().eq("id", id).eq("created_by", user.id)

    if (error) {
      console.error("Error deleting test:", error)
      throw new Error(`Failed to delete test: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteTest:", error)
    throw error
  }
}

export async function archiveTest(id: string) {
  const supabase = createClient()

  try {
    // Get the current user
    const user = await getUserOrThrow(supabase)

    const { error } = await supabase.from("tests").update({ archived: true }).eq("id", id).eq("created_by", user.id)

    if (error) {
      console.error("Error archiving test:", error)
      throw new Error(`Failed to archive test: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error in archiveTest:", error)
    throw error
  }
}

export async function getTestPreviewLink(id: string) {
  const supabase = createClient()

  try {
    // Get the current user
    const user = await getUserOrThrow(supabase)

    // Get the test and ensure the user owns it
    const { data: test, error } = await supabase
      .from("tests")
      .select("id, preview_token")
      .eq("id", id)
      .eq("created_by", user.id)
      .single()

    if (error) {
      console.error("Error fetching test:", error)
      throw new Error(`Failed to fetch test: ${error.message}`)
    }

    if (!test) {
      throw new Error("Test not found")
    }

    // If preview_token is null, generate a new one
    if (!test.preview_token) {
      const newToken = crypto.randomUUID()
      const { error: updateError } = await supabase
        .from("tests")
        .update({ preview_token: newToken })
        .eq("id", id)
        .eq("created_by", user.id)

      if (updateError) {
        console.error("Error updating preview token:", updateError)
        throw new Error(`Failed to generate preview link: ${updateError.message}`)
      }

      return { previewToken: newToken }
    }

    return { previewToken: test.preview_token }
  } catch (error) {
    console.error("Error in getTestPreviewLink:", error)
    throw error
  }
}
