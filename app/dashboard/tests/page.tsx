"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Film } from "lucide-react"
import { TestCard } from "@/components/test-card"

export default function TestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Mock data for tests
  const allTests = [
    {
      id: "test-1",
      title: "Senior Video Editor Assessment",
      role: "Editor",
      sections: ["Editing", "Color Grading"],
      totalTime: 75,
      candidates: 12,
      created: "2023-04-10",
    },
    {
      id: "test-2",
      title: "Motion Graphics Specialist",
      role: "Editor",
      sections: ["Editing"],
      totalTime: 45,
      candidates: 8,
      created: "2023-04-05",
    },
    {
      id: "test-3",
      title: "Sound Designer Evaluation",
      role: "Sound Designer",
      sections: ["Sound Design"],
      totalTime: 30,
      candidates: 5,
      created: "2023-04-01",
    },
    {
      id: "test-4",
      title: "Junior Editor Assessment",
      role: "Editor",
      sections: ["Editing"],
      totalTime: 60,
      candidates: 24,
      created: "2023-03-15",
    },
    {
      id: "test-5",
      title: "Commercial Colorist Test",
      role: "Colorist",
      sections: ["Color Grading"],
      totalTime: 40,
      candidates: 7,
      created: "2023-03-10",
    },
    {
      id: "test-6",
      title: "Documentary Editor Assessment",
      role: "Editor",
      sections: ["Editing", "Sound Design"],
      totalTime: 90,
      candidates: 15,
      created: "2023-03-05",
    },
  ]

  const filteredTests = allTests.filter(
    (test) =>
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getFilteredTests = () => {
    if (activeTab === "all") return filteredTests
    return filteredTests.filter((test) => test.role.toLowerCase() === activeTab)
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tests</h1>
          <p className="text-muted-foreground">Create and manage your assessment tests</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/create">
            <Plus className="mr-2 h-4 w-4" /> Create Test
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            className="pl-8 w-full md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="editor">Editors</TabsTrigger>
            <TabsTrigger value="colorist">Colorists</TabsTrigger>
            <TabsTrigger value="sound designer">Sound</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {getFilteredTests().length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredTests().map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted/20 p-6 mb-4">
            <Film className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No tests found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery ? `No tests match your search for "${searchQuery}"` : "You haven't created any tests yet"}
          </p>
          <Button asChild>
            <Link href="/dashboard/create">
              <Plus className="mr-2 h-4 w-4" /> Create your first test
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
