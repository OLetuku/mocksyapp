"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Search, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Mock candidates data
  const allCandidates = [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex@example.com",
      role: "Editor",
      testTitle: "Senior Video Editor Assessment",
      testId: "test-1",
      submittedAt: "2023-04-12T14:30:00Z",
      status: "completed",
    },
    {
      id: 2,
      name: "Sam Wilson",
      email: "sam@example.com",
      role: "Editor",
      testTitle: "Motion Graphics Specialist",
      testId: "test-2",
      submittedAt: "2023-04-11T10:15:00Z",
      status: "completed",
    },
    {
      id: 3,
      name: "Taylor Smith",
      email: "taylor@example.com",
      role: "Editor",
      testTitle: "Senior Video Editor Assessment",
      testId: "test-1",
      submittedAt: "2023-04-10T16:45:00Z",
      status: "in_progress",
    },
    {
      id: 4,
      name: "Jordan Lee",
      email: "jordan@example.com",
      role: "Sound Designer",
      testTitle: "Sound Designer Evaluation",
      testId: "test-3",
      submittedAt: "2023-04-09T09:20:00Z",
      status: "expired",
    },
    {
      id: 5,
      name: "Casey Morgan",
      email: "casey@example.com",
      role: "Colorist",
      testTitle: "Commercial Colorist Test",
      testId: "test-5",
      submittedAt: "2023-04-08T11:10:00Z",
      status: "completed",
    },
    {
      id: 6,
      name: "Riley Parker",
      email: "riley@example.com",
      role: "Editor",
      testTitle: "Documentary Editor Assessment",
      testId: "test-6",
      submittedAt: "2023-04-07T15:25:00Z",
      status: "in_progress",
    },
  ]

  const filteredCandidates = allCandidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.testTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getFilteredCandidates = () => {
    if (activeTab === "all") return filteredCandidates
    return filteredCandidates.filter((candidate) => candidate.status === activeTab)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "in_progress":
        return <Badge className="bg-blue-500">In Progress</Badge>
      case "expired":
        return <Badge variant="outline">Expired</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">View and manage all candidate submissions</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invite-candidates">
            <UserPlus className="mr-2 h-4 w-4" /> Invite Candidates
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            className="pl-8 w-full md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="w-full md:w-auto">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Candidates ({filteredCandidates.length})</CardTitle>
          <CardDescription>View all candidates who have taken or are taking assessments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredCandidates().length > 0 ? (
                getFilteredCandidates().map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`/placeholder-user-${candidate.id}.jpg`} alt={candidate.name} />
                          <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{candidate.name}</div>
                          <div className="text-sm text-muted-foreground">{candidate.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/${candidate.testId}`} className="hover:underline">
                        {candidate.testTitle}
                      </Link>
                    </TableCell>
                    <TableCell>{candidate.role}</TableCell>
                    <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                    <TableCell>{formatDate(candidate.submittedAt)}</TableCell>
                    <TableCell className="text-right">
                      {candidate.status === "completed" && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/${candidate.testId}/candidates/${candidate.id}`}>View Details</Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <p className="text-muted-foreground">No candidates found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
