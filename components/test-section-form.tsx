"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Film,
  Trash2,
  Wand2,
  Volume2,
  Layers,
  Box,
  Sparkles,
  CuboidIcon as Cube,
  PenTool,
  Palette,
  Megaphone,
  Camera,
  FileText,
  LinkIcon,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface TestSectionFormProps {
  section: {
    id: number
    type: string
    timeLimit: number
    instructions: string
    referenceLink: string
    downloadLink: string
    outputFormat: string
    submissionType?: string
  }
  index: number
  updateSection: (data: any) => void
  removeSection: () => void
  canRemove: boolean
}

export function TestSectionForm({ section, index, updateSection, removeSection, canRemove }: TestSectionFormProps) {
  const getSectionIcon = () => {
    switch (section.type) {
      // Video disciplines
      case "editing":
        return <Film className="h-5 w-5" />
      case "color":
        return <Wand2 className="h-5 w-5" />
      case "sound":
        return <Volume2 className="h-5 w-5" />
      case "compositor":
        return <Layers className="h-5 w-5" />
      case "motion-graphics":
        return <Sparkles className="h-5 w-5" />
      case "vfx-artist":
        return <Box className="h-5 w-5" />
      case "3d-animator":
        return <Cube className="h-5 w-5" />

      // Copywriting disciplines
      case "marketing-copy":
        return <Megaphone className="h-5 w-5" />
      case "content-writing":
        return <FileText className="h-5 w-5" />
      case "creative-writing":
        return <PenTool className="h-5 w-5" />
      case "technical-writing":
        return <FileText className="h-5 w-5" />

      // Design disciplines
      case "graphic-design":
        return <Palette className="h-5 w-5" />
      case "ui-ux-design":
        return <Layers className="h-5 w-5" />
      case "web-design":
        return <LinkIcon className="h-5 w-5" />
      case "illustration":
        return <PenTool className="h-5 w-5" />

      // Photography disciplines
      case "photography":
        return <Camera className="h-5 w-5" />

      default:
        return <Sparkles className="h-5 w-5" />
    }
  }

  const getSectionTitle = () => {
    switch (section.type) {
      // Video disciplines
      case "editing":
        return "Video Editing"
      case "color":
        return "Color Grading"
      case "sound":
        return "Sound Design"
      case "compositor":
        return "Compositing"
      case "motion-graphics":
        return "Motion Graphics"
      case "vfx-artist":
        return "VFX"
      case "3d-animator":
        return "3D Animation"

      // Copywriting disciplines
      case "marketing-copy":
        return "Marketing Copy"
      case "content-writing":
        return "Content Writing"
      case "creative-writing":
        return "Creative Writing"
      case "technical-writing":
        return "Technical Writing"

      // Design disciplines
      case "graphic-design":
        return "Graphic Design"
      case "ui-ux-design":
        return "UI/UX Design"
      case "web-design":
        return "Web Design"
      case "illustration":
        return "Illustration"

      // Photography disciplines
      case "photography":
        return "Photography"

      default:
        return "Section"
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              {getSectionIcon()}
            </div>
            <div>
              <h3 className="font-medium">
                Section {index + 1}: {getSectionTitle()}
              </h3>
            </div>
          </div>
          {canRemove && (
            <Button variant="ghost" size="icon" onClick={removeSection} aria-label="Remove section">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Accordion type="single" collapsible defaultValue="section-type" className="w-full">
          <AccordionItem value="section-type">
            <AccordionTrigger className="py-3">Section Type & Duration</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor={`section-type-${section.id}`}>Section Type</Label>
                  <Select value={section.type} onValueChange={(value) => updateSection({ type: value })}>
                    <SelectTrigger id={`section-type-${section.id}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heading" disabled className="font-semibold">
                        Video Production
                      </SelectItem>
                      <SelectItem value="editing">Video Editing</SelectItem>
                      <SelectItem value="color">Color Grading</SelectItem>
                      <SelectItem value="sound">Sound Design</SelectItem>
                      <SelectItem value="compositor">Compositing</SelectItem>
                      <SelectItem value="motion-graphics">Motion Graphics</SelectItem>
                      <SelectItem value="vfx-artist">VFX</SelectItem>
                      <SelectItem value="3d-animator">3D Animation</SelectItem>

                      <SelectItem value="heading-copy" disabled className="font-semibold">
                        Copywriting
                      </SelectItem>
                      <SelectItem value="marketing-copy">Marketing Copy</SelectItem>
                      <SelectItem value="content-writing">Content Writing</SelectItem>
                      <SelectItem value="creative-writing">Creative Writing</SelectItem>
                      <SelectItem value="technical-writing">Technical Writing</SelectItem>

                      <SelectItem value="heading-design" disabled className="font-semibold">
                        Design
                      </SelectItem>
                      <SelectItem value="graphic-design">Graphic Design</SelectItem>
                      <SelectItem value="ui-ux-design">UI/UX Design</SelectItem>
                      <SelectItem value="web-design">Web Design</SelectItem>
                      <SelectItem value="illustration">Illustration</SelectItem>

                      <SelectItem value="heading-photo" disabled className="font-semibold">
                        Photography
                      </SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`time-limit-${section.id}`}>Time Limit (minutes)</Label>
                  <Input
                    id={`time-limit-${section.id}`}
                    type="number"
                    min="1"
                    value={section.timeLimit}
                    onChange={(e) => updateSection({ timeLimit: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="instructions">
            <AccordionTrigger className="py-3">Instructions</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                <Label htmlFor={`instructions-${section.id}`}>Instructions</Label>
                <Textarea
                  id={`instructions-${section.id}`}
                  placeholder="Provide detailed instructions for this section"
                  value={section.instructions}
                  onChange={(e) => updateSection({ instructions: e.target.value })}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about what you want candidates to accomplish in this section.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="resources">
            <AccordionTrigger className="py-3">Resources & Materials</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor={`reference-link-${section.id}`}>Reference Link</Label>
                  <Input
                    id={`reference-link-${section.id}`}
                    placeholder="URL to reference material (website, image, etc.)"
                    value={section.referenceLink}
                    onChange={(e) => updateSection({ referenceLink: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a link to reference material that candidates should follow.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`download-link-${section.id}`}>Download Link</Label>
                  <Input
                    id={`download-link-${section.id}`}
                    placeholder="Link to download files or resources"
                    value={section.downloadLink}
                    onChange={(e) => updateSection({ downloadLink: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Link to files that candidates will need to complete this section.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="submission">
            <AccordionTrigger className="py-3">Submission Requirements</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor={`submission-type-${section.id}`}>Submission Type</Label>
                  <Select
                    value={section.submissionType || "file"}
                    onValueChange={(value) => updateSection({ submissionType: value })}
                  >
                    <SelectTrigger id={`submission-type-${section.id}`}>
                      <SelectValue placeholder="Select submission type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Response</SelectItem>
                      <SelectItem value="file">File Upload</SelectItem>
                      <SelectItem value="link">External Link</SelectItem>
                      <SelectItem value="image">Image Upload</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How should candidates submit their work for this section?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`output-format-${section.id}`}>Expected Output</Label>
                  <Input
                    id={`output-format-${section.id}`}
                    placeholder="e.g., PDF, JPEG, MP4, 500-word article"
                    value={section.outputFormat}
                    onChange={(e) => updateSection({ outputFormat: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Specify the format, length, or other requirements for the final output.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
