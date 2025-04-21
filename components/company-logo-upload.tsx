"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

interface CompanyLogoUploadProps {
  currentLogo: string | null
  onLogoChange: (url: string) => void
  userId: string
}

export function CompanyLogoUpload({ currentLogo, onLogoChange, userId }: CompanyLogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogo)
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("company-logos").upload(`${userId}/${file.name}`, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) throw error

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("company-logos").getPublicUrl(data.path)

      // Set preview and notify parent
      setPreviewUrl(publicUrlData.publicUrl)
      onLogoChange(publicUrlData.publicUrl)

      toast({
        title: "Logo uploaded",
        description: "Your company logo has been uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your logo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeLogo = () => {
    setPreviewUrl(null)
    onLogoChange("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="company-logo">Company Logo</Label>
        {previewUrl && (
          <Button variant="ghost" size="sm" onClick={removeLogo}>
            <X className="h-4 w-4 mr-1" /> Remove
          </Button>
        )}
      </div>

      {previewUrl ? (
        <div className="relative h-32 w-32 rounded-md overflow-hidden border">
          <Image src={previewUrl || "/placeholder.svg"} alt="Company logo" fill className="object-contain" />
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 w-32 rounded-md border border-dashed">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-xs text-muted-foreground mt-1">Upload logo</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          id="company-logo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("company-logo")?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload Logo"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Upload a square logo image (PNG or JPEG, max 2MB). This will appear in emails sent to candidates.
      </p>
    </div>
  )
}
