"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Sparkles, Plus, Users, PenTool, Palette, Film, Megaphone, Camera } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TestCard } from "@/components/test-card"
import { getTests } from "@/lib/services/test-service"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [disciplineFilter, setDisciplineFilter] = useState("all")
  const [tests, setTests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const testsData = await getTests()
        setTests(testsData || [])
      } catch (err) {
        console.error("Error fetching tests:", err)
        setError(err.message || "Failed to load tests")
        toast({
          title: "Error loading tests",
          description: err.message || "There was a problem loading your tests. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchTests()
    } else {
      setIsLoading(false)
    }
  }, [user])

  // Filter tests based on active tab and discipline
  const filteredTests = tests.filter((test) => {
    // First filter by active/archived status
    const statusMatch =
      activeTab === "all" || (activeTab === "active" && !test.archived) || (activeTab === "archived" && test.archived)

    // Then filter by discipline if not "all"
    const disciplineMatch = disciplineFilter === "all" || test.discipline === disciplineFilter

    return statusMatch && disciplineMatch
  })

  // Get discipline counts
  const disciplineCounts = tests.reduce((counts, test) => {
    if (!test.archived) {
      counts[test.discipline] = (counts[test.discipline] || 0) + 1
    }
    return counts
  }, {})

  // Get discipline icon
  const getDisciplineIcon = (discipline) => {
    switch (discipline) {
      case "copywriting":
        return <PenTool className="h-4 w-4" />
      case "design":
        return <Palette className="h-4 w-4" />
      case "video":
        return <Film className="h-4 w-4" />
      case "marketing":
        return <Megaphone className="h-4 w-4" />
      case "photography":
        return <Camera className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Manage your assessment tests and review candidate submissions.</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Test
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/create">Manual Creation</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/create-ai">
                  <Sparkles className="mr-2 h-4 w-4" /> AI-Powered Creation
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Error Loading Dashboard</h2>
            <p className="text-red-600">{error}</p>
            <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your creative assessments across all disciplines.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Test
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/create">Manual Creation</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/create-ai">
                <Sparkles className="mr-2 h-4 w-4" /> AI-Powered Creation
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tests.length}</div>
            <p className="text-xs text-muted-foreground">
              {tests.filter((t) => !t.archived).length} active, {tests.filter((t) => t.archived).length} archived
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Across all assessments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Test Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tests.length > 0
                ? Math.round(tests.reduce((acc, test) => acc + (test.total_time || 0), 0) / tests.length)
                : 0}{" "}
              min
            </div>
            <p className="text-xs text-muted-foreground">Average time per test</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col space-y-4">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="all">All Tests</TabsTrigger>
              <TabsTrigger value="active">Active Tests</TabsTrigger>
              <TabsTrigger value="archived">Archived Tests</TabsTrigger>
            </TabsList>

            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2">
              <Button
                variant={disciplineFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setDisciplineFilter("all")}
                className="whitespace-nowrap"
              >
                All Disciplines
              </Button>
              {Object.keys(disciplineCounts).map((discipline) => (
                <Button
                  key={discipline}
                  variant={disciplineFilter === discipline ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDisciplineFilter(discipline)}
                  className="whitespace-nowrap"
                >
                  {getDisciplineIcon(discipline)}
                  <span className="ml-1 capitalize">{discipline}</span>
                  <span className="ml-1 text-xs">({disciplineCounts[discipline]})</span>
                </Button>
              ))}
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredTests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => (
                  <TestCard
                    key={test.id}
                    test={{
                      id: test.id,
                      title: test.title,
                      discipline: test.discipline,
                      category: test.category,
                      sections: [], // This would come from a real API in a production app
                      totalTime: test.total_time || 0,
                      candidates: 0, // This would come from a real API in a production app
                      created: test.created_at,
                      aiGenerated: test.ai_generated,
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground mb-4">No tests found</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create your first test
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/create">Manual Creation</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/create-ai">
                          <Sparkles className="mr-2 h-4 w-4" /> AI-Powered Creation
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
