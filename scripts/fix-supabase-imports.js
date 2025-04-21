const fs = require("fs")
const path = require("path")

// Function to recursively scan a directory for files
function scanDirectory(dir, fileExtensions = [".js", ".jsx", ".ts", ".tsx"]) {
  const files = []

  try {
    if (!fs.existsSync(dir)) {
      return files
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // Skip node_modules and .next directories
        if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git") {
          files.push(...scanDirectory(fullPath, fileExtensions))
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (fileExtensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message)
  }

  return files
}

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8")
    let modified = false

    // Check if this file imports from lib/supabase/server
    if (
      content.includes("from '@/lib/supabase/server'") ||
      content.includes('from "@/lib/supabase/server"') ||
      content.includes("from '../lib/supabase/server'") ||
      content.includes('from "../lib/supabase/server"') ||
      content.includes("from '../../lib/supabase/server'") ||
      content.includes('from "../../lib/supabase/server"')
    ) {
      // Replace with router-aware client
      content = content.replace(
        /import\s+\{\s*createClient\s*\}\s+from\s+['"](.+?)\/server['"]/g,
        "import { createRouterAwareClient } from '$1/router-aware-client'",
      )

      // Replace usage of createClient() with createRouterAwareClient(req, res)
      content = content.replace(/createClient$$$$/g, "createRouterAwareClient(req, res)")

      modified = true
    }

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8")
      console.log(`Fixed imports in ${filePath}`)
      return true
    }

    return false
  } catch (error) {
    console.error(`Error fixing imports in ${filePath}:`, error.message)
    return false
  }
}

// Main function
function main() {
  console.log("Fixing Supabase imports in pages/ directory...")

  // Check if pages directory exists
  const pagesDir = path.join(process.cwd(), "pages")
  if (!fs.existsSync(pagesDir)) {
    console.log("No pages/ directory found.")
    return
  }

  // Scan pages directory
  const files = scanDirectory(pagesDir)
  console.log(`Found ${files.length} files in pages/ directory.`)

  // Fix imports in each file
  let fixedCount = 0
  for (const file of files) {
    if (fixImportsInFile(file)) {
      fixedCount++
    }
  }

  console.log(`Fixed imports in ${fixedCount} files.`)
  console.log("Done!")
}

main()
