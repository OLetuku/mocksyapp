// This file contains server-only code and should never be imported in client components
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Gemini API client
const getGeminiClient = () => {
  const apiKey = process.env.GOOGLE_API_KEY

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY environment variable is not set")
  }

  return new GoogleGenerativeAI(apiKey)
}

// Create a structured prompt for Gemini
export const createTestPrompt = (params: any): string => {
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
export const parseAIResponse = (response: string): any => {
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

    return parsedResponse
  } catch (error) {
    console.error("Error parsing AI response:", error)
    throw new Error("Failed to parse AI response")
  }
}

// Generate a test using Gemini - SERVER ONLY
export async function generateTestWithAIServer(params: any): Promise<any> {
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
    throw new Error(error instanceof Error ? error.message : "Failed to generate test with AI")
  }
}
