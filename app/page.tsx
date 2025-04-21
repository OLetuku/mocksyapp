import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, PenTool, Palette, Film, Megaphone, Camera } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Mocksy</span>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Features
          </Link>
          <Link href="#disciplines" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Disciplines
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            How it works
          </Link>
        </nav>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center rounded-full bg-muted/20 px-3 py-1 text-xs font-medium uppercase text-muted-foreground">
              AI-powered assessments for creative professionals
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Hire the best <span className="text-primary italic">creative talent</span> with confidence
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create custom, AI-generated assessments to evaluate skills across copywriting, design, video, and other
              creative disciplines.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/dashboard/create-ai">
                  Create an assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#disciplines">Explore disciplines</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Generated Tests</h3>
                <p className="text-muted-foreground">
                  Create professional assessments in seconds with our AI test generator, tailored to your specific
                  needs.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <PenTool className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Multi-Discipline Support</h3>
                <p className="text-muted-foreground">
                  Evaluate skills across copywriting, design, video, marketing, photography, and more.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Film className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Comprehensive Assessments</h3>
                <p className="text-muted-foreground">
                  Create multi-part tests with individual time limits and specific requirements for each skill.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="disciplines" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Creative Disciplines</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              Mocksy supports assessments across all creative fields, helping you find the perfect talent for your team.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="border rounded-lg p-6 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <PenTool className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Copywriting</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Evaluate writing skills across marketing copy, content writing, technical writing, and creative
                  writing.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Marketing Copy</li>
                  <li>• Content Writing</li>
                  <li>• Technical Writing</li>
                  <li>• Creative Writing</li>
                  <li>• SEO Writing</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Design</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Test design skills including graphic design, UI/UX design, web design, and illustration.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Graphic Design</li>
                  <li>• UI/UX Design</li>
                  <li>• Web Design</li>
                  <li>• Logo Design</li>
                  <li>• Illustration</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Film className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Video</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Assess video editing, motion graphics, color grading, and other video production skills.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Video Editing</li>
                  <li>• Motion Graphics</li>
                  <li>• Color Grading</li>
                  <li>• Sound Design</li>
                  <li>• VFX & Animation</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Marketing</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Evaluate marketing skills including social media, email marketing, content strategy, and SEO.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Social Media</li>
                  <li>• Email Marketing</li>
                  <li>• Content Strategy</li>
                  <li>• SEO</li>
                  <li>• Brand Strategy</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Photography</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Test photography skills including portrait, product, landscape, and event photography.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Portrait Photography</li>
                  <li>• Product Photography</li>
                  <li>• Landscape Photography</li>
                  <li>• Event Photography</li>
                  <li>• Photo Editing</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Custom Tests</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Create custom assessments for any creative discipline or combination of skills.
                </p>
                <div className="mt-8">
                  <Button asChild className="w-full">
                    <Link href="/dashboard/create-ai">
                      <Sparkles className="mr-2 h-4 w-4" /> Create Custom Test
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 px-4 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <div className="text-primary font-bold text-lg mb-2">For Recruiters</div>
                  <h3 className="text-2xl font-semibold mb-4">Create AI-powered assessments</h3>
                  <ul className="space-y-3">
                    <li className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-medium">1</span>
                      </div>
                      <span>Select your creative discipline and category</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-medium">2</span>
                      </div>
                      <span>Customize difficulty, duration, and specific skills</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-medium">3</span>
                      </div>
                      <span>Generate a professional assessment with AI</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-medium">4</span>
                      </div>
                      <span>Share test link with candidates</span>
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2 bg-muted/20 rounded-lg p-6 shadow-sm">
                  <img src="/ai-test-interface.png" alt="AI test creation" className="rounded-md w-full" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                <div className="md:w-1/2">
                  <div className="text-primary font-bold text-lg mb-2">For Candidates</div>
                  <h3 className="text-2xl font-semibold mb-4">Complete timed assessments</h3>
                  <ul className="space-y-3">
                    <li className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-medium">1</span>
                      </div>
                      <span>Review test requirements and time commitment</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-medium">2</span>
                      </div>
                      <span>Access resources and instructions</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-medium">3</span>
                      </div>
                      <span>Complete each section within the time limit</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-medium">4</span>
                      </div>
                      <span>Submit your work and receive feedback</span>
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2 bg-muted/20 rounded-lg p-6 shadow-sm">
                  <img src="/placeholder.svg?key=zljtz" alt="Candidate taking a test" className="rounded-md w-full" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold">Mocksy</span>
          </div>
          <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} Mocksy. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
