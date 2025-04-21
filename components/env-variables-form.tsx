"use client"

import { useState } from "react"
import { useEnv } from "@/contexts/env-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function EnvVariablesForm() {
  const { missingVariables, setVariable, checkingVariables } = useEnv()
  const [open, setOpen] = useState(missingVariables.length > 0)
  const [values, setValues] = useState<Record<string, string>>({})

  if (checkingVariables || missingVariables.length === 0) {
    return null
  }

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    Object.entries(values).forEach(([key, value]) => {
      if (value.trim()) {
        setVariable(key, value.trim())
      }
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Missing Environment Variables</DialogTitle>
          <DialogDescription>
            Please provide the following environment variables to enable all features.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {missingVariables.map((variable) => (
            <div key={variable} className="space-y-2">
              <Label htmlFor={variable}>{variable}</Label>
              <Input
                id={variable}
                type={
                  variable.toLowerCase().includes("key") || variable.toLowerCase().includes("secret")
                    ? "password"
                    : "text"
                }
                value={values[variable] || ""}
                onChange={(e) => handleChange(variable, e.target.value)}
                placeholder={`Enter ${variable}`}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Variables</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
