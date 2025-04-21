// Remove any imports of next/headers or other server-only components
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createTest } from "./test-service"

// Types for the AI test generation
interface TestGenerationParams {
  discipline: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: number
  numSections: number
  specificSkills: string[]
  additionalInstructions?: string
}

interface TestSection {
  title: string
  description: string
  duration: number
  index: number
}

interface GeneratedTest {
  title: string
  description: string
  sections: TestSection[]
}

// Mock data for fallback
const mockGeneratedTests: Record<string, GeneratedTest> = {
  "Video Editing": {
    title: "Video Editing Skills Assessment",
    description: "This test evaluates your video editing skills including transitions, timing, and effects.",
    sections: [
      {
        title: "Basic Editing and Transitions",
        description:
          "Edit the provided footage to create a cohesive 30-second clip using at least 3 different transition types.",
        duration: 30,
        index: 0,
      },
      {
        title: "Color Grading and Effects",
        description:
          "Apply color grading and at least 2 special effects to the provided footage to enhance visual appeal.",
        duration: 30,
        index: 1,
      },
    ],
  },
  "Graphic Design": {
    title: "Graphic Design Skills Assessment",
    description: "This test evaluates your graphic design skills including layout, typography, and brand consistency.",
    sections: [
      {
        title: "Logo Design",
        description: "Create a logo for a fictional company based on the provided brief.",
        duration: 30,
        index: 0,
      },
      {
        title: "Social Media Graphics",
        description: "Design 3 social media graphics that maintain brand consistency with the logo you created.",
        duration: 30,
        index: 1,
      },
    ],
  },
}

/**
 * Generates a test using Google's Gemini AI
 */
export async function generateTestWithAI(params: TestGenerationParams): Promise<GeneratedTest> {
  try {
    // Check if API key is available
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      console.warn("GOOGLE_API_KEY not found, using mock data")
      return getMockTest(params)
    }

    // Initialize the Google Generative AI with the API key
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    // Create the prompt
    const prompt = createPrompt(params)

    // Generate content
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the response
    try {
      // Try to parse as JSON directly
      const parsedTest = parseAIResponse(text, params)
      return parsedTest
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      console.log("Raw AI response:", text)
      return getMockTest(params)
    }
  } catch (error) {
    console.error("Error generating test with AI:", error)
    return getMockTest(params)
  }
}

/**
 * Creates a prompt for the AI based on the test parameters
 */
function createPrompt(params: TestGenerationParams): string {
  const { discipline, category, difficulty, duration, numSections, specificSkills, additionalInstructions } = params

  return `
    Generate a creative assessment test for ${discipline} with a focus on ${category}.
    
    Test details:
    - Difficulty level: ${difficulty}
    - Total duration: ${duration} minutes
    - Number of sections: ${numSections}
    - Skills to test: ${specificSkills.join(", ")}
    ${additionalInstructions ? `- Additional instructions: ${additionalInstructions}` : ""}
    
    Please format your response as a JSON object with the following structure:
    {
      "title": "The title of the test",
      "description": "A detailed description of the test",
      "sections": [
        {
          "title": "Section 1 title",
          "description": "Detailed instructions for section 1",
          "duration": 30,
          "index": 0
        },
        ...
      ]
    }
    
    Make sure:
    1. The test is challenging but doable within the time limit
    2. Instructions are clear and specific
    3. The test accurately assesses the specified skills
    4. The total duration of all sections equals the total test duration
    5. Each section has a unique index starting from 0
    
    Return ONLY the JSON object with no additional text.
  `
}

/**
 * Parses the AI response into a structured test object
 */
function parseAIResponse(response: string, params: TestGenerationParams): GeneratedTest {
  // Try to extract JSON from the response
  const jsonMatch = response.match(/\{[\s\S]*\}/)

  if (jsonMatch) {
    try {
      const parsedJson = JSON.parse(jsonMatch[0])

      // Validate the structure
      if (!parsedJson.title || !parsedJson.description || !Array.isArray(parsedJson.sections)) {
        throw new Error("Invalid response structure")
      }

      // Ensure all sections have the required fields
      parsedJson.sections = parsedJson.sections.map((section, i) => ({
        title: section.title || `Section ${i + 1}`,
        description: section.description || "Complete the assigned task.",
        duration: section.duration || Math.floor(params.duration / params.numSections),
        index: section.index !== undefined ? section.index : i,
      }))

      return parsedJson
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error.message}`)
    }
  } else {
    throw new Error("No JSON found in response")
  }
}

/**
 * Gets mock test data when AI generation fails
 */
function getMockTest(params: TestGenerationParams): GeneratedTest {
  const { discipline, category, duration, numSections } = params

  // Try to get a mock test for the discipline, or fall back to Video Editing
  const mockTest = mockGeneratedTests[discipline] || mockGeneratedTests["Video Editing"]

  // Adjust the mock test to match the requested parameters
  const adjustedTest = {
    ...mockTest,
    title: `${discipline}: ${category} Assessment`,
    description: `This test evaluates your ${discipline} skills with a focus on ${category}.`,
  }

  // Adjust section durations to match the requested total duration
  const sectionDuration = Math.floor(duration / numSections)
  adjustedTest.sections = adjustedTest.sections.slice(0, numSections)

  // If we need more sections than are in the mock, add generic ones
  while (adjustedTest.sections.length < numSections) {
    adjustedTest.sections.push({
      title: `Task ${adjustedTest.sections.length + 1}`,
      description: `Complete the assigned ${discipline} task according to the requirements.`,
      duration: sectionDuration,
      index: adjustedTest.sections.length,
    })
  }

  // Update all section durations
  adjustedTest.sections = adjustedTest.sections.map((section, i) => ({
    ...section,
    duration: sectionDuration,
    index: i,
  }))

  return adjustedTest
}

/**
 * Saves an AI-generated test to the database
 */
export async function saveAIGeneratedTest(userId: string, testData: GeneratedTest) {
  try {
    // Create the test in the database
    const test = await createTest({
      user_id: userId,
      title: testData.title,
      description: testData.description,
      sections: testData.sections.map((section) => ({
        title: section.title,
        description: section.description,
        duration: section.duration,
        index: section.index,
      })),
    })

    return test
  } catch (error) {
    console.error("Error saving AI-generated test:", error)
    throw error
  }
}
