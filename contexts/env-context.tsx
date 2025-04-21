"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type EnvContextType = {
  getVariable: (key: string) => string | null
  setVariable: (key: string, value: string) => void
  checkVariable: (key: string) => boolean
  missingVariables: string[]
  checkingVariables: boolean
}

const EnvContext = createContext<EnvContextType | undefined>(undefined)

export function EnvProvider({
  children,
  requiredVariables = [],
}: { children: ReactNode; requiredVariables?: string[] }) {
  const [envVars, setEnvVars] = useState<Record<string, string>>({})
  const [missingVariables, setMissingVariables] = useState<string[]>([])
  const [checkingVariables, setCheckingVariables] = useState(true)

  useEffect(() => {
    // Load stored variables from localStorage
    const loadStoredVariables = () => {
      const storedVars = localStorage.getItem("env_variables")
      if (storedVars) {
        try {
          setEnvVars(JSON.parse(storedVars))
        } catch (error) {
          console.error("Error parsing stored environment variables:", error)
        }
      }
    }

    // Check which required variables are missing
    const checkMissingVariables = async () => {
      setCheckingVariables(true)
      try {
        const response = await fetch("/api/env/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ variables: requiredVariables }),
        })

        if (response.ok) {
          const data = await response.json()
          setMissingVariables(data.missingVariables || [])
        }
      } catch (error) {
        console.error("Error checking environment variables:", error)
      } finally {
        setCheckingVariables(false)
      }
    }

    loadStoredVariables()
    if (requiredVariables.length > 0) {
      checkMissingVariables()
    } else {
      setCheckingVariables(false)
    }
  }, [requiredVariables])

  const getVariable = (key: string): string | null => {
    return envVars[key] || null
  }

  const setVariable = (key: string, value: string) => {
    const updatedVars = { ...envVars, [key]: value }
    setEnvVars(updatedVars)
    localStorage.setItem("env_variables", JSON.stringify(updatedVars))

    // Remove from missing variables if it was missing
    if (missingVariables.includes(key)) {
      setMissingVariables(missingVariables.filter((v) => v !== key))
    }
  }

  const checkVariable = (key: string): boolean => {
    return !missingVariables.includes(key)
  }

  return (
    <EnvContext.Provider value={{ getVariable, setVariable, checkVariable, missingVariables, checkingVariables }}>
      {children}
    </EnvContext.Provider>
  )
}

export function useEnv() {
  const context = useContext(EnvContext)
  if (context === undefined) {
    throw new Error("useEnv must be used within an EnvProvider")
  }
  return context
}
