"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MoreHorizontal, Users, Sparkles, PenTool, Palette, Film, Megaphone, Camera } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { archiveTest, deleteTest } from "@/lib/services/test-service"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface TestCardProps {
  test: {
    id: string
    title: string
    discipline: string
    category: string
    sections: string[]
    totalTime: number
    candidates: number
    created: string
    aiGenerated?: boolean
  }
}

export function TestCard({ test }: TestCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const handleArchive = async () => {
    try {
      setIsLoading(true)
      await archiveTest(test.id)
      toast({
        title: "Test archived",
        description: "The test has been archived successfully.",
      })
      router.refresh()
    } catch (error) {
      console.error("Error archiving test:", error)
      toast({
        title: "Error archiving test",
        description: "There was a problem archiving the test. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
      return
    }

    try {
      setIsLoading(true)
      await deleteTest(test.id)
      toast({
        title: "Test deleted",
        description: "The test has been deleted successfully.",
      })
      router.refresh()
    } catch (error) {
      console.error("Error deleting test:", error)
      toast({
        title: "Error deleting test",
        description: "There was a problem deleting the test. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDisciplineIcon = (discipline: string) => {
    switch (discipline) {
      case "copywriting":
        return <PenTool className="h-3 w-3" />
      case "design":
        return <Palette className="h-3 w-3" />
      case "video":
        return <Film className="h-3 w-3" />
      case "marketing":
        return <Megaphone className="h-3 w-3" />
      case "photography":
        return <Camera className="h-3 w-3" />
      default:
        return <Sparkles className="h-3 w-3" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{test.title}</CardTitle>
            {test.aiGenerated && (
              <Badge variant="outline" className="mt-1 bg-purple-50">
                <Sparkles className="h-3 w-3 mr-1 text-purple-500" /> AI-Generated
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isLoading}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/${test.id}/edit`}>Edit Test</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/${test.id}/duplicate`}>Duplicate</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive}>Archive</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {getDisciplineIcon(test.discipline)} <span className="capitalize">{test.discipline}</span>
            </Badge>
            <Badge variant="outline">{test.category}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{test.totalTime} min</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{test.candidates} candidates</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">Created on {formatDate(test.created)}</div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/dashboard/${test.id}/candidates`}>View Candidates</Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/dashboard/${test.id}/invite`}>Invite</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
