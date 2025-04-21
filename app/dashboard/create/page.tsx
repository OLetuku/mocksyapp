"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, ArrowRight, Check, Clock, Plus, X } from "lucide-react"
import Link from "next/link"
import { TestSectionForm } from "@/components/test-section-form"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { createTest } from "@/lib/services/test-service"
import { useAuth } from "@/contexts/auth-context"

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

export default function CreateTestPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [testName, setTestName] = useState("")
  const [discipline, setDiscipline] = useState("")
  const [category, setCategory] = useState("")
  const [sections, setSections] = useState([
    {
      id: 1,
      title: "",
      type: "editing",
      timeLimit: 45,
      instructions: "",
      referenceLink: "",
      downloadLink: "",
      outputFormat: "",
      submissionType: "file",
    },
  ])
  const [settings, setSettings] = useState({
    watermark: false,
    preventSkipping: true,
    limitAttempts: true,
  })

  const totalSteps = 4

  useEffect(() => {
    // Update progress when step changes
    setProgress((currentStep / totalSteps) * 100)
  }, [currentStep])

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const addSection = () => {
    const newId = sections.length > 0 ? Math.max(...sections.map((s) => s.id)) + 1 : 1
    setSections([
      ...sections,
      {
        id: newId,
        title: "",
        type: "editing",
        timeLimit: 30,
        instructions: "",
        referenceLink: "",
        downloadLink: "",
        outputFormat: "",
        submissionType: "file",
      },
    ])
  }

  const removeSection = (id) => {
    if (sections.length > 1) {
      setSections(sections.filter((section) => section.id !== id))
    }
  }

  const updateSection = (id, data) => {
    setSections(sections.map((section) => (section.id === id ? { ...section, ...data } : section)))
  }

  const getTotalTime = () => {
    return sections.reduce((total, section) => total + (Number.parseInt(section.timeLimit) || 0), 0)
  }

  const handleSettingChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value,
    })
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Validate current step
      if (currentStep === 1 && (!testName || !discipline || !category)) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields before continuing.",
          variant: "destructive",
        })
        return
      }

      if (currentStep === 2) {
        // Check if all sections have required fields
        const invalidSections = sections.some((section) => !section.type || !section.timeLimit || !section.instructions)

        if (invalidSections) {
          toast({
            title: "Incomplete sections",
            description: "Please complete all section details before continuing.",
            variant: "destructive",
          })
          return
        }
      }

      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Format sections for the API
      const formattedSections = sections.map((section) => ({
        title: section.title || `${section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section`,
        type: section.type,
        timeLimit: section.timeLimit,
        instructions: section.instructions,
        referenceLink: section.referenceLink,
        downloadLink: section.downloadLink,
        outputFormat: section.outputFormat,
        submissionType: section.submissionType || "file",
      }))

      // Create the test
      const result = await createTest(
        testName,
        discipline,
        category,
        formattedSections,
        settings,
        false, // not AI-generated
      )

      toast({
        title: "Test created successfully",
        description: "Your new assessment test has been created.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating test:", error)

      // Show a more detailed error message
      toast({
        title: "Error creating test",
        description: error.message || "There was a problem creating your test. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepIndicator = () => {
    return (
      <div className="mb-8">
        <Progress value={progress} className="h-2 mb-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
              <CardDescription>Let's start with the basic information about this assessment test.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="test-name">Test Name</Label>
                  <Input
                    id="test-name"
                    placeholder="e.g., Senior Copywriter Assessment"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    This is what candidates will see when they take the test.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="discipline">Creative Discipline</Label>
                  <Select value={discipline} onValueChange={setDiscipline} required>
                    <SelectTrigger id="discipline">
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
                  <p className="text-sm text-muted-foreground">
                    Select the primary creative discipline for this assessment.
                  </p>
                </div>

                {discipline && (
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CREATIVE_DISCIPLINES[discipline]?.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Select the specific category within the chosen discipline.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button type="button" onClick={nextStep}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )

      case 2:
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Test Sections</CardTitle>
                <CardDescription>Add one or more sections to your test.</CardDescription>
              </div>
              <Button type="button" onClick={addSection} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {sections.map((section, index) => (
                <TestSectionForm
                  key={section.id}
                  section={section}
                  index={index}
                  updateSection={(data) => updateSection(section.id, data)}
                  removeSection={() => removeSection(section.id)}
                  canRemove={sections.length > 1}
                />
              ))}

              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div>
                  <h3 className="font-medium">Total Test Duration</h3>
                  <p className="text-sm text-muted-foreground">Estimated time: {getTotalTime()} minutes</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{getTotalTime()} min</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="button" onClick={nextStep}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Test Settings</CardTitle>
              <CardDescription>Configure additional settings for your test.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="watermark">Watermark Instructions</Label>
                  <p className="text-sm text-muted-foreground">
                    Add candidate email as a watermark on instruction screens
                  </p>
                </div>
                <Switch
                  id="watermark"
                  checked={settings.watermark}
                  onCheckedChange={(checked) => handleSettingChange("watermark", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prevent-skipping">Prevent Skipping Steps</Label>
                  <p className="text-sm text-muted-foreground">Candidate must complete each step in order</p>
                </div>
                <Switch
                  id="prevent-skipping"
                  checked={settings.preventSkipping}
                  onCheckedChange={(checked) => handleSettingChange("preventSkipping", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="limit-attempts">Limit Test Attempts</Label>
                  <p className="text-sm text-muted-foreground">Limit to one attempt per candidate email</p>
                </div>
                <Switch
                  id="limit-attempts"
                  checked={settings.limitAttempts}
                  onCheckedChange={(checked) => handleSettingChange("limitAttempts", checked)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="button" onClick={nextStep}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Review & Create</CardTitle>
              <CardDescription>Review your test details before creating it.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium text-lg mb-2">Test Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Test Name</p>
                      <p>{testName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Discipline</p>
                      <p className="capitalize">{discipline}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Category</p>
                      <p>{category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Duration</p>
                      <p>{getTotalTime()} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Number of Sections</p>
                      <p>{sections.length}</p>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-medium text-lg mb-2">Test Sections</h3>
                  <div className="space-y-3">
                    {sections.map((section, index) => (
                      <div key={section.id} className="bg-muted/20 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">
                            Section {index + 1}:{" "}
                            {section.type.charAt(0).toUpperCase() + section.type.slice(1).replace("-", " ")}
                          </p>
                          <p className="text-sm text-muted-foreground">{section.timeLimit} min</p>
                        </div>
                        <p className="text-sm truncate">
                          {section.instructions.substring(0, 100)}
                          {section.instructions.length > 100 ? "..." : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2">Test Settings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {settings.watermark ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>Watermark Instructions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {settings.preventSkipping ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>Prevent Skipping Steps</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {settings.limitAttempts ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>Limit Test Attempts</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Test"}
              </Button>
            </CardFooter>
          </Card>
        )

      default:
        return null
    }
  }

  if (authLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
      </div>

      {renderStepIndicator()}

      <form onSubmit={(e) => e.preventDefault()}>{renderStepContent()}</form>
    </div>
  )
}
