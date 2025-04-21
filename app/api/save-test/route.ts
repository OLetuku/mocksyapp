import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { userId, testData } = await request.json()

    if (!userId || !testData) {
      return NextResponse.json({ error: "Missing required fields: userId and testData" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Insert the test
    const { data: test, error: testError } = await supabase
      .from("tests")
      .insert({
        title: testData.title,
        description: `AI-generated ${testData.discipline} assessment for ${testData.category}`,
        user_id: userId,
        ai_generated: true,
      })
      .select()
      .single()

    if (testError) {
      return NextResponse.json({ error: "Failed to create test" }, { status: 500 })
    }

    // Insert the test sections
    const sections = testData.sections.map((section, index) => ({
      test_id: test.id,
      title: section.title,
      instructions: section.instructions,
      time_limit: section.timeLimit * 60, // Convert minutes to seconds
      type: section.type,
      index,
      submission_type: section.submissionType,
      output_format: section.outputFormat || null,
      reference_link: section.referenceLink || null,
      download_link: section.downloadLink || null,
    }))

    const { error: sectionsError } = await supabase.from("test_sections").insert(sections)

    if (sectionsError) {
      return NextResponse.json({ error: "Failed to create test sections" }, { status: 500 })
    }

    // Insert the test settings
    const { error: settingsError } = await supabase.from("test_settings").insert({
      test_id: test.id,
      watermark: testData.settings.watermark,
      prevent_skipping: testData.settings.preventSkipping,
      limit_attempts: testData.settings.limitAttempts,
    })

    if (settingsError) {
      return NextResponse.json({ error: "Failed to create test settings" }, { status: 500 })
    }

    return NextResponse.json({
      id: test.id,
      ...testData,
    })
  } catch (error) {
    console.error("Error saving test:", error)
    return NextResponse.json({ error: "Failed to save test" }, { status: 500 })
  }
}
