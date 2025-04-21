// This is a script you can run locally to find problematic imports
// It's not part of the build, just a helper

const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)

// List of server-only imports that cause issues
const SERVER_IMPORTS = ["next/headers", "next/server", "next/navigation", "cookies", "headers"]

// Directories to scan
const DIRS_TO_SCAN = ["app", "pages", "components", "lib"]

// Function to check if a file contains server-only imports
async function checkFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8")

    // Check for server imports
    const problematicImports = SERVER_IMPORTS.filter(
      (importStr) =>
        content.includes(`from '${importStr}'`) ||
        content.includes(`from "${importStr}"`) ||
        content.includes(`require('${importStr}')`) ||
        content.includes(`require("${importStr}")`),
    )

    // Check if it's a client component
    const isClientComponent = content.includes("'use client'") || content.includes('"use client"')

    // If it's a client component with server imports, it's problematic
    if (isClientComponent && problematicImports.length > 0) {
      return {
        path: filePath,
        imports: problematicImports,
        isClientComponent,
      }
    }

    // If it's in the pages directory with server imports, it's problematic
    if (filePath.includes("/pages/") && problematicImports.length > 0) {
      return {
        path: filePath,
        imports: problematicImports,
        isInPagesDir: true,
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
  console.log("Scanning for problematic server imports...")

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
    console.log("2. Use the utility functions in lib/utils/headers.ts for accessing headers")
    console.log("3. Create API routes for client components that need server functionality")
  }
}

main().catch(console.error)
