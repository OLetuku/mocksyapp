"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, Mail } from "lucide-react"

interface EmailVerificationAlertProps {
  email: string
  onResend: () => void
  isResending: boolean
  emailResent: boolean
}

export function EmailVerificationAlert({ email, onResend, isResending, emailResent }: EmailVerificationAlertProps) {
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <Mail className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Email verification required</AlertTitle>
      <AlertDescription className="text-amber-700">
        Your email address <strong>{email}</strong> has not been verified. Please check your inbox for the verification
        link or request a new one.
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onResend}
            disabled={isResending || emailResent}
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Sending...
              </>
            ) : emailResent ? (
              "Email sent!"
            ) : (
              "Resend verification email"
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
