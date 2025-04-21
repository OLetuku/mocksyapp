"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle, CheckCircle, Settings } from "lucide-react"

export function EnvVariablesStatus() {
  const [status, setStatus] = useState<{
    configured: boolean
    missing: string[]
    available: string[]
  }>({
    configured: false,
    missing: [],
    available: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkEnvVariables = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/env/check")
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error("Error checking environment variables:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkEnvVariables()
  }, [])

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Email Configuration</CardTitle>
          <CardDescription>Checking email configuration...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (status.configured) {
    return (
      <Card className="mb-6 border-green-100 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Email Configuration</CardTitle>
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
              <CheckCircle className="mr-1 h-3 w-3" /> Configured
            </Badge>
          </div>
          <CardDescription>Email service is properly configured and ready to use.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="mb-6 border-amber-100 bg-amber-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Email Configuration</CardTitle>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <AlertCircle className="mr-1 h-3 w-3" /> Attention Needed
          </Badge>
        </div>
        <CardDescription>
          {status.missing.length > 0
            ? "Some email configuration variables are missing."
            : "Email configuration needs to be verified."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Configure Email Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Email Configuration</DialogTitle>
              <DialogDescription>
                The following environment variables are needed for email functionality:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Missing Variables:</h3>
                {status.missing.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm">
                    {status.missing.map((variable) => (
                      <li key={variable} className="text-red-600">
                        {variable}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No missing variables.</p>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Available Variables:</h3>
                {status.available.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm">
                    {status.available.map((variable) => (
                      <li key={variable} className="text-green-600">
                        {variable}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No variables configured yet.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                Refresh Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
