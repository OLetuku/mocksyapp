"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { CompanyLogoUpload } from "@/components/company-logo-upload"
import { EnvVariablesStatus } from "@/components/env-variables-status"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    companyDescription: "",
    companyIndustry: "",
    companySize: "",
    companyWebsite: "",
    companyLogo: "",
  })

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        // Initialize from user metadata
        setProfileData({
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
          company: user.user_metadata?.company_name || "",
          role: user.user_metadata?.job_title || "",
          companyDescription: user.user_metadata?.company_description || "",
          companyIndustry: user.user_metadata?.company_industry || "",
          companySize: user.user_metadata?.company_size || "",
          companyWebsite: user.user_metadata?.company_website || "",
          companyLogo: user.user_metadata?.company_logo_url || "",
        })

        // Get profile from database
        const supabase = createClient()
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (data && !error) {
          setProfileData({
            name: data.full_name || user.user_metadata?.full_name || "",
            email: user.email || "",
            company: data.company || user.user_metadata?.company_name || "",
            role: data.role || user.user_metadata?.job_title || "",
            companyDescription: data.company_description || user.user_metadata?.company_description || "",
            companyIndustry: data.company_industry || user.user_metadata?.company_industry || "",
            companySize: data.company_size || user.user_metadata?.company_size || "",
            companyWebsite: data.company_website || user.user_metadata?.company_website || "",
            companyLogo: data.company_logo_url || user.user_metadata?.company_logo_url || "",
          })
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      [name]: value,
    })
  }

  const handleSelectChange = (name, value) => {
    setProfileData({
      ...profileData,
      [name]: value,
    })
  }

  const handleLogoChange = (url) => {
    setProfileData({
      ...profileData,
      companyLogo: url,
    })
  }

  const saveProfile = async () => {
    if (!user) return

    setIsSaving(true)

    try {
      const supabase = createClient()

      // Update profile in database
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: profileData.name,
        company: profileData.company,
        role: profileData.role,
        company_description: profileData.companyDescription,
        company_industry: profileData.companyIndustry,
        company_size: profileData.companySize,
        company_website: profileData.companyWebsite,
        company_logo_url: profileData.companyLogo,
        updated_at: new Date().toISOString(),
      })

      if (profileError) throw profileError

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.name,
          company_name: profileData.company,
          job_title: profileData.role,
          company_description: profileData.companyDescription,
          company_industry: profileData.companyIndustry,
          company_size: profileData.companySize,
          company_website: profileData.companyWebsite,
          company_logo_url: profileData.companyLogo,
        },
      })

      if (metadataError) throw metadataError

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error updating profile",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
        <p className="text-muted-foreground">
          Update your company information that will appear in emails sent to candidates
        </p>
      </div>

      <EnvVariablesStatus />

      <Tabs defaultValue="basic">
        <TabsList className="mb-6">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="company">Company Details</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="John Doe"
                />
                <p className="text-xs text-muted-foreground">
                  Your name will appear as the sender of invitation emails
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" value={profileData.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">This is your login email and cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  name="company"
                  value={profileData.company}
                  onChange={handleProfileChange}
                  placeholder="Acme Productions"
                />
                <p className="text-xs text-muted-foreground">
                  Your company name will appear in emails and test interfaces
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Your Job Title</Label>
                <Input
                  id="role"
                  name="role"
                  value={profileData.role}
                  onChange={handleProfileChange}
                  placeholder="Hiring Manager"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>
                This information will be displayed to candidates in emails and assessments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyDescription">Company Description</Label>
                <Textarea
                  id="companyDescription"
                  name="companyDescription"
                  value={profileData.companyDescription}
                  onChange={handleProfileChange}
                  placeholder="Tell candidates about your company"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">This will appear in invitation emails</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyIndustry">Industry</Label>
                <Select
                  value={profileData.companyIndustry}
                  onValueChange={(value) => handleSelectChange("companyIndustry", value)}
                >
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
                <Select
                  value={profileData.companySize}
                  onValueChange={(value) => handleSelectChange("companySize", value)}
                >
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
                  name="companyWebsite"
                  type="url"
                  value={profileData.companyWebsite}
                  onChange={handleProfileChange}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Company Branding</CardTitle>
              <CardDescription>Upload your company logo and customize your brand appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user && (
                <CompanyLogoUpload
                  currentLogo={profileData.companyLogo}
                  onLogoChange={handleLogoChange}
                  userId={user.id}
                />
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={saveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
