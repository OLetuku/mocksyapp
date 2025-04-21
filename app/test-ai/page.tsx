"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

export default function TestAIPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [testParams, setTestParams] = useState({
    discipline: "Video Editing",
    category: "Motion Graphics",
    difficulty: "intermediate",
    duration: 60,
    numSections: 2,
    specificSkills: "After Effects, Transitions, Timing",
    additionalInstructions: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTestParams((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setTestParams((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const checkApiStatus = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/status")
      const data = await response.json()
      setApiStatus(data)
    } catch (error) {
      setError("Failed to check API status: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const generateTest = async () => {
    setIsLoading(true)
    setError(null)
    setTestResult(null)

    try {
      // Create the request payload
      const payload = {
        ...testParams,
        specificSkills: testParams.specificSkills.split(",").map((skill) => skill.trim()),
        numSections: Number(testParams.numSections),
        duration: Number(testParams.duration),
      }

      // Call your AI test service directly
      const { generateTestWithAI } = await import("@/lib/services/ai-test-service")
      const result = await generateTestWithAI(payload)
      setTestResult(result)
    } catch (error) {
      setError("Failed to generate test: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Test AI Integration</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>API Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={checkApiStatus} disabled={isLoading} className="mb-4">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Check API Status
            </Button>

            {apiStatus && (
              <div className="p-4 bg-muted rounded-md">
                <pre className="whitespace-pre-wrap">{JSON.stringify(apiStatus, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discipline">Discipline</Label>
              <Input id="discipline" name="discipline" value={testParams.discipline} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" value={testParams.category} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={testParams.difficulty} onValueChange={(value) => handleSelectChange("difficulty", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={testParams.duration}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numSections">Number of Sections</Label>
              <Input
                id="numSections"
                name="numSections"
                type="number"
                value={testParams.numSections}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specificSkills">Specific Skills (comma separated)</Label>
              <Input
                id="specificSkills"
                name="specificSkills"
                value={testParams.specificSkills}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInstructions">Additional Instructions</Label>
              <Textarea
                id="additionalInstructions"
                name="additionalInstructions"
                value={testParams.additionalInstructions}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <Button onClick={generateTest} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Test
            </Button>
          </CardContent>
        </Card>
      </div>

      {error && <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">{error}</div>}

      {testResult && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Generated Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-md overflow-auto max-h-[500px]">
              <pre className="whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
