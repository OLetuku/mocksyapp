"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Film, AlertTriangle, Clock, ArrowRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { validateInvitationToken } from "@/lib/services/candidate-service"
import { getTestById } from "@/lib/services/test-service"

export default function TestPage({ params }) {
  const { id } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isLoading, setIsLoading] = useState(true)
  const [isValidating, setIsValidating] = useState(false)
  const [test, setTest] = useState(null)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState("")

  useEffect(() => {
    const validateAccess = async () => {
      try {
        setIsLoading(true)

        // Fetch test details
        const testData = await getTestById(id)
        setTest(testData.test)

        // If token is provided, validate it
        if (token) {
          const validation = await validateInvitationToken(id, token)

          if (!validation.valid) {
            setError(validation.error)
          } else {
            // Token is valid, redirect to test start page
            router.push(`/test/${id}/start?token=${token}`)
          }
        }
      } catch (error) {
        console.error("Error validating access:", error)
        setError("Test not found or you don't have access to it.")
      } finally {
        setIsLoading(false)
      }
    }

    validateAccess()
  }, [id, token, router])

  const handleEmailSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsValidating(true)

      // Check if there's an invitation for this email
      const response = await fetch(`/api/tests/${id}/validate-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to validate email")
      }

      if (data.valid && data.token) {
        // Email is valid, redirect to test start page
        router.push(`/test/${id}/start?token=${data.token}`)
      } else {
        setError("No invitation found for this email address.")
      }
    } catch (error) {
      console.error("Error validating email:", error)
      toast({
        title: "Error validating email",
        description: error.message || "There was a problem validating your email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Test not found or you don't have access to it.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Film className="h-8 w-8 text-primary mr-2" />
          <span className="text-2xl font-bold">ReelTest</span>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{test.title}</CardTitle>
            <CardDescription>Assessment for {test.role} position</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="mb-4">
              <p>Please enter your email address to access this test.</p>
              <p className="text-sm text-muted-foreground mt-2">You need to have been invited to take this test.</p>
            </div>

            <form onSubmit={handleEmailSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Estimated time: {test.total_time} minutes</span>
                </div>
                <Button type="submit" disabled={isValidating}>
                  {isValidating ? "Validating..." : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ReelTest. All rights reserved.
        </p>
      </div>
    </div>
  )
}
