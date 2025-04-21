"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Film } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function SignupPage() {
  const { signUp, user, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [companyDescription, setCompanyDescription] = useState("")
  const [companyIndustry, setCompanyIndustry] = useState("")
  const [companySize, setCompanySize] = useState("")
  const [companyWebsite, setCompanyWebsite] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1 = account details, 2 = basic org details, 3 = additional org details

  // Redirect if already logged in
  if (!loading && user) {
    router.push("/dashboard")
    return null
  }

  const handleNextStep = () => {
    if (step === 1 && (!email || !password)) {
      setError("Please fill in all required fields")
      return
    }

    if (step === 2 && (!fullName || !companyName)) {
      setError("Please fill in all required fields")
      return
    }

    setError("")
    setStep(step + 1)
  }

  const handlePrevStep = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Pass the additional user metadata to the signUp function
      await signUp(email, password, {
        full_name: fullName,
        company_name: companyName,
        job_title: jobTitle || "Hiring Manager",
        company_description: companyDescription,
        company_industry: companyIndustry,
        company_size: companySize,
        company_website: companyWebsite,
      })
    } catch (err) {
      console.error("Signup error:", err)

      // Handle specific error messages
      if (err.message.includes("Email not confirmed")) {
        setError(
          "Please check your email for a verification link. For this demo, you can also try logging in directly.",
        )
      } else {
        setError(err.message || "Failed to sign up")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-2">
        <Film className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Mocksy</span>
      </div>

      <Card className="w-full max-w-md">
        <form
          onSubmit={
            step === 3
              ? handleSubmit
              : (e) => {
                  e.preventDefault()
                  handleNextStep()
                }
          }
        >
          <CardHeader>
            <CardTitle>
              {step === 1 ? "Create Account" : step === 2 ? "Organization Details" : "Additional Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-600 rounded-md text-sm">{error}</div>
            )}

            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : step === 2 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Your Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">This will appear in emails sent to candidates</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Your Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Hiring Manager"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyDescription">Company Description</Label>
                  <Textarea
                    id="companyDescription"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    placeholder="Tell candidates about your company"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">This will appear in invitation emails</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyIndustry">Industry</Label>
                  <Select value={companyIndustry} onValueChange={setCompanyIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Media & Entertainment">Media & Entertainment</SelectItem>
                      <SelectItem value="Marketing & Advertising">Marketing & Advertising</SelectItem>
                      <SelectItem value="Design & Creative">Design & Creative</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1001+">1001+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            {step === 1 ? (
              <Button type="submit" className="w-full">
                Continue
              </Button>
            ) : step === 2 ? (
              <>
                <Button type="submit" className="w-full">
                  Continue
                </Button>
                <Button type="button" variant="ghost" className="mt-2" onClick={handlePrevStep}>
                  Back
                </Button>
              </>
            ) : (
              <>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
                <Button type="button" variant="ghost" className="mt-2" onClick={handlePrevStep} disabled={isLoading}>
                  Back
                </Button>
              </>
            )}
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
