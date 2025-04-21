"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Download, Search } from "lucide-react"

export default function CandidatesPage({ params }) {
  const { id } = params
  const [searchQuery, setSearchQuery] = useState("")

  // Mock test data
  const test = {
    id,
    title: "Senior Video Editor Assessment",
    role: "Editor",
    sections: [
      { id: 1, title: "Video Editing", timeLimit: 45 },
      { id: 2, title: "Color Grading", timeLimit: 30 },
    ],
  }

  // Mock candidates data
  const candidates = [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex@example.com",
      submittedAt: "2023-04-12T14:30:00Z",
      status: "completed",
      sectionTimes: [42, 28],
      links: ["https://drive.google.com/file/d/example1", "https://drive.google.com/file/d/example2"],
    },
    {
      id: 2,
      name: "Sam Wilson",
      email: "sam@example.com",
      submittedAt: "2023-04-11T10:15:00Z",
      status: "completed",
      sectionTimes: [39, 25],
      links: ["https://drive.google.com/file/d/example3", "https://drive.google.com/file/d/example4"],
    },
    {
      id: 3,
      name: "Taylor Smith",
      email: "taylor@example.com",
      submittedAt: "2023-04-10T16:45:00Z",
      status: "in_progress",
      sectionTimes: [40, null],
      links: ["https://drive.google.com/file/d/example5", null],
    },
    {
      id: 4,
      name: "Jordan Lee",
      email: "jordan@example.com",
      submittedAt: "2023-04-09T09:20:00Z",
      status: "expired",
      sectionTimes: [null, null],
      links: [null, null],
    },
  ]

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{test.title}</h1>
          <p className="text-muted-foreground">Candidate submissions and results</p>
        </div>
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
          <Button size="sm" asChild className="w-full md:w-auto">
            <Link href={`/dashboard/${id}/invite`}>Invite Candidates</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidates ({candidates.length})</CardTitle>
          <CardDescription>View all candidates who have taken or are taking this assessment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                {test.sections.map((section) => (
                  <TableHead key={section.id}>{section.title}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-sm text-muted-foreground">{candidate.email}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                    <TableCell>{formatDate(candidate.submittedAt)}</TableCell>
                    {test.sections.map((section, index) => (
                      <TableCell key={section.id}>
                        {candidate.sectionTimes[index] !== null ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{candidate.sectionTimes[index]} min</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      {candidate.status === "completed" && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/${id}/candidates/${candidate.id}`}>View Details</Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4 + test.sections.length} className="text-center py-6">
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
