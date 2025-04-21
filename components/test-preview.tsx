"use client"

import { useState } from "react"
import { Film, Wand2, Volume2, Layers, Box, Sparkles, CuboidIcon as Cube, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TestPreview({ test }) {
  const [currentStep, setCurrentStep] = useState("intro") // intro, section-1, section-2, etc., complete
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [sectionStatus, setSectionStatus] = useState(
    test.test_sections.map(() => ({
      started: false,
      completed: false,
      timeSpent: 0,
      submissionLink: "",
      comments: "",
    })),
  )

  const [submissionLink, setSubmissionLink] = useState("")
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentSection, setCurrentSection] = useState(null)

  // Sort sections by order_index
  const sections = [...test.test_sections].sort((a, b) => a.order_index - b.order_index)

  // Calculate total time
  const totalTime = sections.reduce((total, section) => total + section.time_limit, 0)

  // Use the same rendering logic as in the test page, but with a preview banner
  // This is a simplified version of app/test/[id]/page.tsx

  const getSectionIcon = (type) => {
    switch (type) {
      case "editing":
        return <Film className="h-4 w-4 text-muted-foreground" />
      case "color":
        return <Wand2 className="h-4 w-4 text-muted-foreground" />
      case "sound":
        return <Volume2 className="h-4 w-4 text-muted-foreground" />
      case "compositor":
        return <Layers className="h-4 w-4 text-muted-foreground" />
      case "motion-graphics":
        return <Sparkles className="h-4 w-4 text-muted-foreground" />
      case "vfx-artist":
        return <Box className="h-4 w-4 text-muted-foreground" />
      case "3d-animator":
        return <Cube className="h-4 w-4 text-muted-foreground" />
      default:
        return <Film className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Rest of the component logic similar to app/test/[id]/page.tsx
  // ...

  return (
    <div className="container py-8">
      <Alert className="mb-6 bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-600">Preview Mode</AlertTitle>
        <AlertDescription>
          You are viewing this test in preview mode. This is how candidates will see your test.
        </AlertDescription>
      </Alert>

      {/* Rest of the UI similar to app/test/[id]/page.tsx */}
      {/* ... */}
    </div>
  )
}
