"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { generateTestWithAI, saveAIGeneratedTest } from "@/lib/services/ai-test-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EnvVariablesStatus } from "@/components/env-variables-status"
import { EnvVariablesForm } from "@/components/env-variables-form"
import { EnvProvider } from "@/contexts/env-context"

// Define creative disciplines and their categories
const CREATIVE_DISCIPLINES = {
  copywriting: [
    "Marketing Copy",
    "Content Writing",
    "Technical Writing",
    "Creative Writing",
    "SEO Writing",
    "Scriptwriting",
  ],
  design: ["Graphic Design", "UI/UX Design", "Web Design", "Logo Design", "Illustration", "Product Design"],
  video: ["Video Editing", "Motion Graphics", "Color Grading", "Sound Design", "VFX", "3D Animation", "Compositing"],
  marketing: ["Social Media", "Email Marketing", "Content Strategy", "SEO", "PPC", "Brand Strategy"],
  photography: ["Portrait", "Product", "Landscape", "Event", "Fashion", "Food"],
}

// Required environment variables
const REQUIRED_VARIABLES = ["GOOGLE_API_KEY"]

export default function CreateAITestPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedTest, setGeneratedTest] = useState(null)
  const [apiStatus, setApiStatus] = useState<{ configured: boolean; provider: string; model: string } | null>(null)
  const [isCheckingApi, setIsCheckingApi] = useState(true)

  const [formData, setFormData] = useState({
    discipline: "",
    category: "",
    difficulty: "intermediate",
    duration: 60,
    numSections: 2,
    specificSkills: "",
    additionalInstructions: "",
  })

  useEffect(() => {
    // Check API status when component mounts
    const checkApiStatus = async () => {
      try {
        const response = await fetch("/api/ai/status")
        if (response.ok) {
          const data = await response.json()
          setApiStatus(data)
        }
      } catch (error) {
        console.error("Error checking API status:", error)
      } finally {
        setIsCheckingApi(false)
      }
    }

    checkApiStatus()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Reset category if discipline changes
    if (name === "discipline") {
      setFormData((prev) => ({
        ...prev,
        category: "",
      }))
    }
  }

  const handleSliderChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value[0],
    }))
  }

  const generateTest = async () => {
    if (!formData.discipline || !formData.category) {
      toast({
        title: "Missing information",
        description: "Please select a discipline and category before generating a test.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedTest(null)

    try {
      const testData = await generateTestWithAI({
        discipline: formData.discipline,
        category: formData.category,
        difficulty: formData.difficulty,
        duration: formData.duration,
        numSections: formData.numSections,
        specificSkills: formData.specificSkills ? formData.specificSkills.split(",").map((s) => s.trim()) : undefined,
        additionalInstructions: formData.additionalInstructions || undefined,
      })

      setGeneratedTest(testData)
      toast({
        title: "Test generated",
        description: "Your AI-powered test has been created. Review and save it to your dashboard.",
      })
    } catch (error) {
      console.error("Error generating test:", error)
      toast({
        title: "Generation failed",
        description: error.message || "There was a problem generating your test. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const saveTest = async () => {
    if (!generatedTest || !user) {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save your test.",
          variant: "destructive",
        })
      }
      return
    }

    setIsSaving(true)

    try {
      const test = await saveAIGeneratedTest(user.id, generatedTest)
      toast({
        title: "Test saved",
        description: "Your AI-generated test has been saved to your dashboard.",
      })
      router.push(`/dashboard/${test.id}/edit`)
    } catch (error) {
      console.error("Error saving test:", error)
      toast({
        title: "Save failed",
        description: error.message || "There was a problem saving your test. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <EnvProvider requiredVariables={REQUIRED_VARIABLES}>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AI Test Creator</h1>
              <p className="text-muted-foreground">Generate custom assessments with AI for any creative discipline</p>
            </div>
          </div>

          <EnvVariablesStatus variables={REQUIRED_VARIABLES} />
        </div>

        <EnvVariablesForm />

        {!isCheckingApi && apiStatus && (
          <div className="mb-6">
            <Alert variant={apiStatus.configured ? "default" : "destructive"} className="bg-muted/50">
              <div className="flex items-center gap-2">
                {apiStatus.configured ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {apiStatus.configured
                    ? `AI generation is enabled using ${apiStatus.provider} ${apiStatus.model}`
                    : "AI generation will use mock data as no API key is configured"}
                </AlertDescription>
              </div>
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Test Parameters</CardTitle>
              <CardDescription>Define what kind of test you want to create</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="discipline">Creative Discipline</Label>
                <Select value={formData.discipline} onValueChange={(value) => handleSelectChange("discipline", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="copywriting">Copywriting</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.discipline && (
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CREATIVE_DISCIPLINES[formData.discipline]?.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleSelectChange("difficulty", value)}>
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
                <div className="flex justify-between">
                  <Label htmlFor="duration">Test Duration (minutes)</Label>
                  <span className="text-sm text-muted-foreground">{formData.duration} min</span>
                </div>
                <Slider
                  id="duration"
                  min={15}
                  max={180}
                  step={15}
                  value={[formData.duration]}
                  onValueChange={(value) => handleSliderChange("duration", value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="numSections">Number of Sections</Label>
                  <span className="text-sm text-muted-foreground">{formData.numSections}</span>
                </div>
                <Slider
                  id="numSections"
                  min={1}
                  max={5}
                  step={1}
                  value={[formData.numSections]}
                  onValueChange={(value) => handleSliderChange("numSections", value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specificSkills">Specific Skills to Test (Optional)</Label>
                <Input
                  id="specificSkills"
                  name="specificSkills"
                  placeholder="e.g., headline writing, email copy, CTAs"
                  value={formData.specificSkills}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">Separate multiple skills with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInstructions">Additional Instructions (Optional)</Label>
                <Textarea
                  id="additionalInstructions"
                  name="additionalInstructions"
                  placeholder="Any specific requirements or focus areas for this test"
                  value={formData.additionalInstructions}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={generateTest} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate Test
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            {generatedTest ? (
              <Card>
                <CardHeader>
                  <CardTitle>{generatedTest.title}</CardTitle>
                  <CardDescription>
                    {generatedTest.discipline} - {generatedTest.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Test Sections</h3>
                    <div className="space-y-4">
                      {generatedTest.sections.map((section, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <h4 className="font-medium">
                            {index + 1}. {section.title}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Type:</span> {section.type}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Time:</span> {section.timeLimit} min
                            </div>
                            <div>
                              <span className="text-muted-foreground">Submission:</span> {section.submissionType}
                            </div>
                            {section.outputFormat && (
                              <div>
                                <span className="text-muted-foreground">Format:</span> {section.outputFormat}
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Instructions:</span>
                            <p className="mt-1 whitespace-pre-line">{section.instructions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={saveTest} disabled={isSaving} className="w-full">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Test"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 bg-muted/20 rounded-lg">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">AI Test Generator</h3>
                <p className="text-center text-muted-foreground mb-4">
                  Fill in the parameters on the left and click "Generate Test" to create a custom assessment with AI.
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Tailored to your specific discipline</li>
                  <li>Customized difficulty levels</li>
                  <li>Detailed instructions for candidates</li>
                  <li>Fully editable after generation</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </EnvProvider>
  )
}
