// Import only client-safe dependencies
import { safePost, safeGet } from "../api/safe-api-client"

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

// Client-safe implementation that uses API endpoints instead of direct imports
export async function generateTestWithAI(params: TestPrompt): Promise<GeneratedTest> {
  try {
    // Use the API endpoint instead of direct Gemini integration
    const response = await safePost<GeneratedTest>("/api/generate-test", params)

    if (response.error) {
      throw new Error(response.error)
    }

    return response.data!
  } catch (error) {
    console.error("Error generating test with AI:", error)
    return getMockTest(params)
  }
}

// Save the AI-generated test via API
export async function saveAIGeneratedTest(userId: string, testData: GeneratedTest) {
  try {
    const response = await safePost("/api/save-test", {
      userId,
      testData,
    })

    if (response.error) {
      throw new Error(response.error)
    }

    return response.data
  } catch (error) {
    console.error("Error saving AI-generated test:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to save test")
  }
}

// Validate an invitation token via API
export async function validateInvitationToken(token: string) {
  try {
    const response = await safeGet(`/api/invitations/validate?token=${encodeURIComponent(token)}`)

    if (response.error) {
      throw new Error(response.error)
    }

    return response.data
  } catch (error) {
    console.error("Error validating invitation token:", error)
    throw new Error(error instanceof Error ? error.message : "Invalid invitation token")
  }
}

// Get test sections via API
export async function getTestSections(testId: string) {
  try {
    const response = await safeGet(`/api/tests/${testId}/sections`)

    if (response.error) {
      throw new Error(response.error)
    }

    return response.data
  } catch (error) {
    console.error("Error getting test sections:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to get test sections")
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
