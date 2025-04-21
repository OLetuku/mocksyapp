"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Film, AlertTriangle, Clock, ArrowRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { validateInvitationToken } from "@/lib/services/candidate-service"
import { getTestById, getTestSections } from "@/lib/services/test-service"

export default function TestStartPage({ params }) {
  const { id } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [test, setTest] = useState(null)
  const [sections, setSections] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const validateAndLoadTest = async () => {
      try {
        setIsLoading(true)

        if (!token) {
          setError("Missing invitation token")
          return
        }

        // Validate token
        const validation = await validateInvitationToken(id, token)

        if (!validation.valid) {
          setError(validation.error)
          return
        }

        // Load test details
        const testData = await getTestById(id)
        setTest(testData.test)

        // Load test sections
        const sectionsData = await getTestSections(id)
        setSections(sectionsData)
      } catch (error) {
        console.error("Error loading test:", error)
        setError("Failed to load test details")
      } finally {
        setIsLoading(false)
      }
    }

    validateAndLoadTest()
  }, [id, token])

  const startTest = async () => {
    try {
      setIsStarting(true)

      // Create test submission
      const response = await fetch("/api/test-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testId: id,
          token,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to start test")
      }

      // Redirect to first section
      router.push(`/test/${id}/section/${sections[0].id}?token=${token}&submission=${data.submissionId}`)
    } catch (error) {
      console.error("Error starting test:", error)
      toast({
        title: "Error starting test",
        description: error.message || "There was a problem starting the test. Please try again.",
        variant: "destructive",
      })
      setIsStarting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <Film className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold">ReelTest</span>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || "Test not found or you don't have access to it."}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-center mb-8">
          <Film className="h-8 w-8 text-primary mr-2" />
          <span className="text-2xl font-bold">ReelTest</span>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{test.title}</CardTitle>
            <CardDescription className="text-lg">Assessment for {test.role} position</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Test Overview</h3>
              <p className="text-muted-foreground">
                This assessment consists of {sections.length} section{sections.length !== 1 ? "s" : ""} and will take
                approximately {test.total_time} minutes to complete.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Sections</h3>
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div key={section.id} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{section.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {section.time_limit} minutes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Important Notes</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Each section has a time limit. Once started, the timer cannot be paused.</li>
                <li>You will need to submit your work before the time expires.</li>
                <li>Make sure you have a stable internet connection before starting.</li>
                <li>Have all necessary software ready for the tasks you'll be performing.</li>
                <li>Read all instructions carefully before beginning each section.</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>Total time: {test.total_time} minutes</span>
            </div>
            <Button onClick={startTest} disabled={isStarting} size="lg">
              {isStarting ? "Starting..." : "Start Test"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ReelTest. All rights reserved.
        </p>
      </div>
    </div>
  )
}
