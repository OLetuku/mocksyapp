"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mail } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function EmailTemplatePreview({ testTitle, testRole, testDuration }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Get company info from user metadata
  const companyName = user?.user_metadata?.company_name || "Mocksy"
  const senderName = user?.user_metadata?.full_name || "Hiring Manager"
  const jobTitle = user?.user_metadata?.job_title || "Hiring Manager"
  const companyDescription = user?.user_metadata?.company_description || ""
  const companyIndustry = user?.user_metadata?.company_industry || ""
  const companyLogo = user?.user_metadata?.company_logo_url || ""

  // Sample invitation link
  const invitationLink = "https://mocksy.app/test/sample-test-id?token=sample-token"

  // Sample message
  const message = `Hi there,\n\nWe were impressed with your application for the ${testRole} position at ${companyName}. As part of our interview process, we'd like to invite you to complete a practical assessment to better understand your skills and experience.\n\nThis assessment will take approximately ${testDuration} minutes to complete.\n\nPlease let me know if you have any questions.\n\nBest regards,\n${senderName}\n${jobTitle}\n${companyName}`

  // Format message with line breaks
  const formattedMessage = message.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ))

  // Industry badge if provided
  const industryBadge = companyIndustry ? (
    <span className="inline-block bg-gray-200 px-2 py-1 rounded text-xs">{companyIndustry}</span>
  ) : null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="mr-2 h-4 w-4" />
          Preview Email Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Email Template Preview</DialogTitle>
          <DialogDescription>
            This is how your invitation email will appear to candidates. Update your company profile to customize it.
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-md p-4 mt-4 bg-white">
          <div className="bg-gray-800 text-white p-4 rounded-t-md text-center">
            {companyLogo ? (
              <img
                src={companyLogo || "/placeholder.svg"}
                alt={`${companyName} Logo`}
                className="max-h-16 max-w-[200px] mx-auto mb-2"
              />
            ) : (
              <h2 className="text-xl font-bold">{companyName}</h2>
            )}
            {industryBadge}
          </div>

          <div className="p-6 border-x border-b rounded-b-md">
            <p className="mb-4">Hello,</p>

            <p className="mb-4">
              We were impressed with your application for the <strong>{testRole}</strong> position at {companyName}. As
              part of our interview process, we'd like to invite you to complete a practical assessment to better
              understand your skills and experience.
            </p>

            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <p>
                <strong>Assessment:</strong> {testTitle}
              </p>
              <p>
                <strong>Role:</strong> {testRole}
              </p>
              <p>
                <strong>Estimated Duration:</strong> {testDuration} minutes
              </p>
            </div>

            <p className="mb-2">
              Message from {senderName}, {jobTitle} at {companyName}:
            </p>
            <p className="mb-4 whitespace-pre-line">{formattedMessage}</p>

            <div className="text-center mb-4">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium">Start Assessment</button>
            </div>

            <p className="text-sm text-gray-600 mb-1">If the button doesn't work, copy and paste this link:</p>
            <p className="text-sm text-blue-600 underline mb-4 break-all">{invitationLink}</p>

            {companyDescription && (
              <div className="bg-gray-100 p-4 rounded-md mb-4 text-sm italic">
                <strong>About {companyName}:</strong>
                <p>{companyDescription}</p>
              </div>
            )}

            <div className="text-center text-xs text-gray-500 mt-6 pt-4 border-t">
              <p>This invitation was sent by {companyName}.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; {new Date().getFullYear()} Mocksy. All rights reserved.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
