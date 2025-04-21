"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ArrowLeft, CalendarIcon, Copy, Mail, Plus, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getTestById } from "@/lib/services/test-service"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EmailTemplatePreview } from "@/components/email-template-preview"

export default function InvitePage({ params }) {
  const { id } = params
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [test, setTest] = useState(null)
  const [emails, setEmails] = useState([""])
  const [message, setMessage] = useState("")
  const [deadline, setDeadline] = useState(null)
  const [sentInvitations, setSentInvitations] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    senderName: "",
    jobTitle: "",
    companyDescription: "",
    companyIndustry: "",
    companyLogo: "",
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

        // Get company info from user metadata
        if (user?.user_metadata) {
          setCompanyInfo({
            companyName: user.user_metadata.company_name || "",
            senderName: user.user_metadata.full_name || "",
            jobTitle: user.user_metadata.job_title || "Hiring Manager",
            companyDescription: user.user_metadata.company_description || "",
            companyIndustry: user.user_metadata.company_industry || "",
            companyLogo: user.user_metadata.company_logo_url || "",
          })
        }

        // Set default message with company name
        const companyName = user?.user_metadata?.company_name || "our company"
        setMessage(
          `Hi there,\n\nWe were impressed with your application for the ${testData.test.role} position at ${companyName}. As part of our interview process, we'd like to invite you to complete a practical assessment to better understand your skills and experience.\n\nThis assessment will take approximately ${testData.test.total_time} minutes to complete.\n\nPlease let me know if you have any questions.\n\nBest regards,\n${user?.user_metadata?.full_name || "The Hiring Team"}\n${user?.user_metadata?.job_title || "Hiring Manager"}\n${companyName}`,
        )
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

  const addEmailField = () => {
    setEmails([...emails, ""])
  }

  const removeEmailField = (index) => {
    if (emails.length > 1) {
      const newEmails = [...emails]
      newEmails.splice(index, 1)
      setEmails(newEmails)
    }
  }

  const updateEmail = (index, value) => {
    const newEmails = [...emails]
    newEmails[index] = value
    setEmails(newEmails)
  }

  const copyLink = () => {
    const testLink = `${window.location.origin}/test/${id}`
    navigator.clipboard.writeText(testLink)
    toast({
      title: "Link copied",
      description: "Test link has been copied to clipboard",
    })
  }

  const validateEmails = (emailList) => {
    const validEmails = emailList.filter((email) => email.trim() && /\S+@\S+\.\S+/.test(email))

    if (validEmails.length === 0) {
      toast({
        title: "No valid emails",
        description: "Please enter at least one valid email address.",
        variant: "destructive",
      })
      return null
    }

    return validEmails
  }

  const sendInvites = async () => {
    const validEmails = validateEmails(emails)
    if (!validEmails) return

    try {
      setIsSending(true)

      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testId: id,
          emails: validEmails,
          message,
          deadline: deadline ? deadline.toISOString() : null,
          companyDescription: companyInfo.companyDescription,
          companyIndustry: companyInfo.companyIndustry,
          companyLogo: companyInfo.companyLogo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitations")
      }

      // Show success message
      setSentInvitations(data.results.filter((r) => r.success).map((r) => r.email))
      setShowSuccess(true)

      // Reset form
      setEmails([""])
      setDeadline(null)

      toast({
        title: "Invites sent",
        description: `Invitations sent to ${data.invited} candidates.`,
      })
    } catch (error) {
      console.error("Error sending invitations:", error)
      toast({
        title: "Error sending invitations",
        description: error.message || "There was a problem sending the invitations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const closeSuccessMessage = () => {
    setShowSuccess(false)
    setSentInvitations([])
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
            <Link href={`/dashboard/${id}/candidates`}>
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

  const testLink = `${window.location.origin}/test/${id}`

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/${id}/candidates`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invite Candidates</h1>
          <p className="text-muted-foreground">{test.title}</p>
        </div>
      </div>

      {showSuccess && sentInvitations.length > 0 && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <Mail className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Invitations sent successfully!</AlertTitle>
          <AlertDescription className="text-green-700">
            <p>Invitations have been sent to the following email addresses:</p>
            <ul className="mt-2 list-disc list-inside">
              {sentInvitations.map((email, index) => (
                <li key={index}>{email}</li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-green-700 border-green-300 hover:bg-green-100"
              onClick={closeSuccessMessage}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="email">
        <TabsList className="mb-6">
          <TabsTrigger value="email">Email Invitation</TabsTrigger>
          <TabsTrigger value="link">Share Link</TabsTrigger>
        </TabsList>

        <div className="flex justify-end mb-4">
          <EmailTemplatePreview testTitle={test.title} testRole={test.role} testDuration={test.total_time} />
        </div>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Send Email Invitations</CardTitle>
              <CardDescription>Invite candidates to take the assessment via email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/20 p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2">Sender Information</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Company:</strong> {companyInfo.companyName || "Not specified"}
                  </p>
                  <p>
                    <strong>Sender:</strong> {companyInfo.senderName || user?.email}
                  </p>
                  <p>
                    <strong>Job Title:</strong> {companyInfo.jobTitle || "Hiring Manager"}
                  </p>
                  {companyInfo.companyIndustry && (
                    <p>
                      <strong>Industry:</strong> {companyInfo.companyIndustry}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This information will appear in the invitation email. You can update your profile details in settings.
                </p>
              </div>
              <div className="space-y-4">
                <Label>Candidate Emails</Label>
                {emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="candidate@example.com"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                    />
                    {emails.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeEmailField(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addEmailField} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" /> Add Another Email
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Assessment Deadline (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!deadline && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : "Select a deadline"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Set a deadline for when candidates should complete the assessment
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={8} value={message} onChange={(e) => setMessage(e.target.value)} />
                <p className="text-xs text-muted-foreground">Personalize the message that will be sent to candidates</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/${id}/candidates`}>Cancel</Link>
              </Button>
              <Button onClick={sendInvites} disabled={isSending}>
                <Mail className="h-4 w-4 mr-2" /> {isSending ? "Sending..." : "Send Invitations"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="link">
          <Card>
            <CardHeader>
              <CardTitle>Share Test Link</CardTitle>
              <CardDescription>Share this link with candidates to take the assessment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="test-link">Test Link</Label>
                <div className="flex gap-2">
                  <Input id="test-link" value={testLink} readOnly />
                  <Button variant="outline" onClick={copyLink}>
                    <Copy className="h-4 w-4 mr-2" /> Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: Candidates will need to enter their email address to access the test.
                </p>
              </div>

              <div className="bg-muted/20 p-4 rounded-md">
                <h3 className="font-medium mb-2">Test Details</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Test:</strong> {test.title}
                  </li>
                  <li>
                    <strong>Role:</strong> {test.role}
                  </li>
                  <li>
                    <strong>Estimated Time:</strong> {test.total_time} minutes
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
