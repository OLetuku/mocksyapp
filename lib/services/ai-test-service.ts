import { createClient } from "@google/generative-ai"
import { createTest } from "./test-service"
import type { Database } from "@/lib/supabase/database.types"

// Types for our test generation
type TestPrompt = {
  discipline: string
  category: string
  difficulty: string
  duration: number
  numSections: number
  specificSkills?: string[]
  additionalInstructions?: string
}

type TestSection = {
  title: string
  type: string
  timeLimit: number
  instructions: string
  referenceLink?: string
  downloadLink?: string
  outputFormat?: string
  submissionType: string
}

type GeneratedTest = {
  title: string
  discipline: string
  category: string
  sections: TestSection[]
  settings: {
    watermark: boolean
    preventSkipping: boolean
    limitAttempts: boolean
  }
}

// Initialize the Gemini API client
const getGeminiClient = () => {
  const apiKey = process.env.GOOGLE_API_KEY

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY environment variable is not set")
  }

  return createClient({ apiKey })
}

// Create a structured prompt for Gemini
const createTestPrompt = (params: TestPrompt): string => {
  const {
    discipline,
    category,
    difficulty,
    duration,
    numSections,
    specificSkills = [],
    additionalInstructions = "",
  } = params

  return `
Create a creative assessment test for ${discipline} professionals, specifically in ${category}.
The test should be at ${difficulty} level and take approximately ${duration} minutes to complete.
It should have exactly ${numSections} sections.

${specificSkills.length > 0 ? `The test should assess these specific skills: ${specificSkills.join(", ")}` : ""}
${additionalInstructions ? `Additional requirements: ${additionalInstructions}` : ""}

Return the response as a JSON object with the following structure:
{
  "title": "A descriptive title for the test",
  "discipline": "${discipline}",
  "category": "${category}",
  "sections": [
    {
      "title": "Section title",
      "type": "One of: text, image, video, audio, file, code",
      "timeLimit": Number of minutes for this section,
      "instructions": "Detailed instructions for the candidate",
      "submissionType": "One of: text, file, link, code",
      "outputFormat": "Expected format of submission (optional)"
    }
  ],
  "settings": {
    "watermark": true or false,
    "preventSkipping": true or false,
    "limitAttempts": true or false
  }
}

Make sure the test is challenging but fair, and the instructions are clear and specific.
`
}

// Parse and validate the AI response
const parseAIResponse = (response: string): GeneratedTest => {
  try {
    // Extract JSON from the response (in case the AI includes additional text)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in the response")
    }

    const jsonStr = jsonMatch[0]
    const parsedResponse = JSON.parse(jsonStr)

    // Validate the response structure
    if (!parsedResponse.title || !parsedResponse.sections || !Array.isArray(parsedResponse.sections)) {
      throw new Error("Invalid response structure")
    }

    return parsedResponse as GeneratedTest
  } catch (error) {
    console.error("Error parsing AI response:", error)
    throw new Error("Failed to parse AI response")
  }
}

// Generate a test using Gemini
export async function generateTestWithAI(params: TestPrompt): Promise<GeneratedTest> {
  try {
    const gemini = getGeminiClient()
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = createTestPrompt(params)
    console.log("Sending prompt to Gemini:", prompt)

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    console.log("Received response from Gemini:", text.substring(0, 200) + "...")

    return parseAIResponse(text)
  } catch (error) {
    console.error("Error generating test with Gemini:", error)

    // Fallback to mock data if there's an error or API key is missing
    if (error.message.includes("GOOGLE_API_KEY") || process.env.NODE_ENV === "development") {
      console.log("Using mock data as fallback")
      return getMockTest(params)
    }

    throw new Error(error.message || "Failed to generate test with AI")
  }
}

// Save the AI-generated test to the database
export async function saveAIGeneratedTest(
  userId: string,
  testData: GeneratedTest,
): Promise<Database["public"]["Tables"]["tests"]["Row"]> {
  try {
    // Use the existing createTest function to save the AI-generated test
    const test = await createTest({
      title: testData.title,
      description: `AI-generated ${testData.discipline} assessment for ${testData.category}`,
      userId,
      sections: testData.sections.map((section, index) => ({
        title: section.title,
        instructions: section.instructions,
        timeLimit: section.timeLimit * 60, // Convert minutes to seconds
        type: section.type,
        index,
        submissionType: section.submissionType,
        outputFormat: section.outputFormat || null,
        referenceLink: section.referenceLink || null,
        downloadLink: section.downloadLink || null,
      })),
      settings: testData.settings,
      aiGenerated: true,
    })

    return test
  } catch (error) {
    console.error("Error saving AI-generated test:", error)
    throw new Error(error.message || "Failed to save AI-generated test")
  }
}

// Fallback mock data function
function getMockTest(params: TestPrompt): GeneratedTest {
  const { discipline, category, difficulty, duration, numSections } = params

  // Create a basic test structure based on the parameters
  const mockTest: GeneratedTest = {
    title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${category} Assessment`,
    discipline,
    category,
    sections: [],
    settings: {
      watermark: true,
      preventSkipping: false,
      limitAttempts: true,
    },
  }

  // Generate mock sections
  const sectionTime = Math.floor(duration / numSections)

  for (let i = 0; i < numSections; i++) {
    let sectionType, submissionType

    // Assign different types based on discipline
    if (discipline.toLowerCase().includes("video")) {
      sectionType = i % 2 === 0 ? "video" : "text"
      submissionType = i % 2 === 0 ? "file" : "text"
    } else if (discipline.toLowerCase().includes("design")) {
      sectionType = i % 2 === 0 ? "image" : "text"
      submissionType = i % 2 === 0 ? "file" : "text"
    } else if (discipline.toLowerCase().includes("code") || discipline.toLowerCase().includes("develop")) {
      sectionType = i % 2 === 0 ? "code" : "text"
      submissionType = i % 2 === 0 ? "code" : "text"
    } else {
      sectionType = "text"
      submissionType = "text"
    }

    mockTest.sections.push({
      title: `Section ${i + 1}: ${category} ${i % 2 === 0 ? "Creation" : "Analysis"}`,
      type: sectionType,
      timeLimit: sectionTime,
      instructions: `Complete this ${difficulty} level ${category} task. ${
        i % 2 === 0
          ? `Create a ${category.toLowerCase()} piece that demonstrates your skills.`
          : `Analyze the provided example and explain your approach.`
      }`,
      submissionType,
      outputFormat: submissionType === "file" ? "PDF" : undefined,
    })
  }

  return mockTest
}
