"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Film, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardLayout({ children }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user && isClient) {
      console.log("No user found in dashboard layout, redirecting to login")
      router.push("/login")
    }
  }, [user, loading, router, isClient])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render anything on the server if we're not sure about auth state
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Film className="h-6 w-6" />
          <span>ReelTest</span>
        </Link>
        <nav className="flex flex-1 items-center gap-4 md:gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-sm">{user.email}</div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
