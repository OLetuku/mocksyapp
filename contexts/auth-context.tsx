"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Check for session on load
  useEffect(() => {
    const getUser = async () => {
      try {
        // Only check for auth on protected routes
        const isPublicRoute = pathname === "/" || pathname === "/login" || pathname === "/signup"

        if (isPublicRoute) {
          // For public routes, we don't need to check auth immediately
          setLoading(false)
          return
        }

        console.log("Checking for user session...")
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting user session:", error.message)
          setUser(null)
        } else if (data?.session) {
          console.log("User session found:", data.session.user?.id)
          setUser(data.session.user)
        } else {
          console.log("No active session found")
          setUser(null)
        }
      } catch (error) {
        console.error("Unexpected error getting user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, pathname])

  // Update the signUp function to include user metadata
  const signUp = async (email, password, userData = {}) => {
    console.log("Signing up with email:", email)
    // First attempt to sign up with user metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })

    if (error) {
      console.error("Signup error:", error)
      throw error
    }

    console.log("Signup response:", data)

    // If the user was created but needs email verification
    if (data?.user && !data.user.confirmed_at) {
      console.log("User created but needs verification, attempting direct signin")
      // Try to sign in directly without verification
      return signIn(email, password)
    }

    // Create or update profile in the profiles table
    if (data?.user) {
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: userData.full_name,
          company: userData.company_name,
          role: userData.job_title,
          company_description: userData.company_description,
          company_industry: userData.company_industry,
          company_size: userData.company_size,
          company_website: userData.company_website,
          company_logo_url: userData.company_logo_url,
          updated_at: new Date().toISOString(),
        })
      } catch (profileError) {
        console.error("Error updating profile:", profileError)
      }
    }

    // If already confirmed, just redirect
    router.push("/dashboard")
  }

  // Update the signIn function to handle unconfirmed emails
  const signIn = async (email, password) => {
    console.log("Signing in with email:", email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Signin error:", error)
      // If the error is about unconfirmed email, we'll try to bypass it
      if (error.message.includes("Email not confirmed")) {
        // Try to force sign in by using admin functions or alternative methods
        // For simplicity in this demo, we'll just throw a more user-friendly error
        throw new Error("Please check your email for a verification link or try again later.")
      }
      throw error
    }

    console.log("Signin successful, user:", data?.user?.id)
    router.push("/dashboard")
  }

  // Simple signout function
  const signOut = async () => {
    console.log("Signing out")
    await supabase.auth.signOut()
    router.push("/login")
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
