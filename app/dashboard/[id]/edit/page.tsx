"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getTestById, updateTest } from "@/lib/services/test-service"
import { useAuth } from "@/contexts/auth-context"
import { TestSectionForm } from "@/components/test-section-form"

export default function EditTestPage({ params }) {
  const { id } = params
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [test, setTest] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    role: "",
    sections: [],
  })

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setIsLoading(true)
        const testData = await getTestById(id)
        setTest(testData.test)

        // Initialize form data
        setFormData({
          title: testData.test.title,
          role: testData.test.role,
          sections: testData.sections || [],
        })
      } catch (error) {
        console.error("Error fetching test:", error)
        toast({
          title: "Error loading test",
          description: "There was a problem loading the test details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user && id) {
      fetchTest()
    }
  }, [id, user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }))
  }

  const handleSectionChange = (index, sectionData) => {
    const updatedSections = [...formData.sections]
    updatedSections[index] = { ...updatedSections[index], ...sectionData }
    setFormData((prev) => ({
      ...prev,
      sections: updatedSections,
    }))
  }

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: `new-section-${Date.now()}`,
          title: "",
          type: "editing",
          time_limit: 30,
          instructions: "",
          reference_link: "",
          download_link: "",
          output_format: "",
        },
      ],
    }))
  }

  const removeSection = (index) => {
    const updatedSections = [...formData.sections]
    updatedSections.splice(index, 1)
    setFormData((prev) => ({
      ...prev,
      sections: updatedSections,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a test title.",
        variant: "destructive",
      })
      return
    }

    if (formData.sections.length === 0) {
      toast({
        title: "No sections",
        description: "Please add at least one test section.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      // Calculate total time
      const totalTime = formData.sections.reduce((sum, section) => sum + (Number.parseInt(section.time_limit) || 0), 0)

      await updateTest(id, {
        title: formData.title,
        role: formData.role,
        total_time: totalTime,
        sections: formData.sections,
      })

      toast({
        title: "Test updated",
        description: "Your test has been updated successfully.",
      })

      router.push(`/dashboard/${id}/candidates`)
    } catch (error) {
      console.error("Error updating test:", error)
      toast({
        title: "Error updating test",
        description: error.message || "There was a problem updating your test. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test not found</h1>
            <p className="text-muted-foreground">
              The test you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/${id}/candidates`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Test</h1>
          <p className="text-muted-foreground">Update your test details and sections</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Test Details</TabsTrigger>
            <TabsTrigger value="sections">Test Sections</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Test Information</CardTitle>
                <CardDescription>Basic information about your test</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Video Editing Assessment"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video-editor">Video Editor</SelectItem>
                      <SelectItem value="colorist">Colorist</SelectItem>
                      <SelectItem value="sound-designer">Sound Designer</SelectItem>
                      <SelectItem value="motion-graphics">Motion Graphics Artist</SelectItem>
                      <SelectItem value="vfx-artist">VFX Artist</SelectItem>
                      <SelectItem value="3d-animator">3D Animator</SelectItem>
                      <SelectItem value="compositor">Compositor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections">
            <div className="space-y-6">
              {formData.sections.map((section, index) => (
                <TestSectionForm
                  key={section.id || index}
                  section={section}
                  onChange={(data) => handleSectionChange(index, data)}
                  onRemove={() => removeSection(index)}
                  showRemove={formData.sections.length > 1}
                />
              ))}

              <Button type="button" variant="outline" onClick={addSection} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Section
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
