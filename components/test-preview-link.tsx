"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Eye } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

interface TestPreviewLinkProps {
  testId: string
  previewToken: string
}

export function TestPreviewLink({ testId, previewToken }: TestPreviewLinkProps) {
  const [copied, setCopied] = useState(false)

  const previewUrl = `${window.location.origin}/preview/${testId}?token=${previewToken}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl)
      setCopied(true)
      toast({
        title: "Link copied",
        description: "Preview link copied to clipboard",
      })

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="text-sm font-medium">Preview Link</div>
      <div className="flex space-x-2">
        <Input value={previewUrl} readOnly className="flex-1" />
        <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copy link">
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" asChild title="Open preview">
          <Link href={previewUrl} target="_blank">
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Share this link to preview the test without creating an invitation.
      </p>
    </div>
  )
}
