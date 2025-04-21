// This script finds problematic imports that could cause build errors
const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)

// List of problematic imports that cause issues in client components
const PROBLEMATIC_IMPORTS = [
  "next/headers",
  "headers",
  "cookies",
  "next/server",
  "next/navigation",
  "useSearchParams",
  "usePathname",
  "useRouter",
  "useParams",
]

// Directories to scan
const DIRS_TO_SCAN = ["app", "pages", "components", "lib"]

// Function to check if a file contains problematic imports
async function checkFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8")

    // Check for problematic imports
    const foundImports = PROBLEMATIC_IMPORTS.filter((importStr) => {
      return (
        content.includes(`from '${importStr}'`) ||
        content.includes(`from "${importStr}"`) ||
        content.includes(`require('${importStr}')`) ||
        content.includes(`require("${importStr}")`)
      )
    })

    // Check if it's a client component
    const isClientComponent = content.includes("'use client'") || content.includes('"use client"')

    // Check if it's in the pages directory
    const isInPagesDir = filePath.includes("/pages/")

    if ((isClientComponent || isInPagesDir) && foundImports.length > 0) {
      return {
        path: filePath,
        imports: foundImports,
        isClientComponent,
        isInPagesDir,
      }
    }

    return null
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error)
    return null
  }
}

// Function to scan directories recursively
async function scanDir(dir) {
  const results = []

  try {
    const files = await readdir(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const fileStat = await stat(filePath)

      if (fileStat.isDirectory()) {
        // Skip node_modules and .next
        if (file !== "node_modules" && file !== ".next") {
          const subResults = await scanDir(filePath)
          results.push(...subResults)
        }
      } else if (file.endsWith(".js") || file.endsWith(".jsx") || file.endsWith(".ts") || file.endsWith(".tsx")) {
        const result = await checkFile(filePath)
        if (result) {
          results.push(result)
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error)
  }

  return results
}

// Main function
async function main() {
  console.log("Scanning for problematic imports...")

  const allResults = []

  for (const dir of DIRS_TO_SCAN) {
    if (fs.existsSync(dir)) {
      const results = await scanDir(dir)
      allResults.push(...results)
    }
  }

  if (allResults.length === 0) {
    console.log("No problematic imports found!")
  } else {
    console.log(`Found ${allResults.length} problematic files:`)

    allResults.forEach((result) => {
      console.log(`\nFile: ${result.path}`)
      console.log(`Problematic imports: ${result.imports.join(", ")}`)
      if (result.isClientComponent) {
        console.log("Issue: Server imports in a client component")
      }
      if (result.isInPagesDir) {
        console.log("Issue: Server imports in pages directory")
      }
    })

    console.log("\nSuggestions:")
    console.log("1. Move server-only logic to server components")
    console.log("2. Use the compatibility layer in lib/compat/headers.ts")
    console.log("3. Create API routes for client components that need server functionality")
  }
}

main().catch(console.error)
