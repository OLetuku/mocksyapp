const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Function to check if a file imports next/headers
function checkFileForHeadersImport(filePath) {
  const content = fs.readFileSync(filePath, "utf8")

  // Check for direct imports
  const directImport = content.includes("from 'next/headers'") || content.includes('from "next/headers"')

  // Check for dynamic imports
  const dynamicImport = content.includes("require('next/headers')") || content.includes('require("next/headers")')

  return directImport || dynamicImport
}

// Function to fix a file that imports next/headers
function fixFileWithHeadersImport(filePath) {
  let content = fs.readFileSync(filePath, "utf8")

  // Replace direct imports
  content = content.replace(
    /import\s+\{\s*headers\s*\}\s+from\s+['"]next\/headers['"]/g,
    "import { getCompatHeaders } from '@/lib/utils/headers'",
  )

  content = content.replace(
    /import\s+\{\s*cookies\s*\}\s+from\s+['"]next\/headers['"]/g,
    "import { getCompatCookies } from '@/lib/utils/headers'",
  )

  // Replace usage of headers()
  content = content.replace(/headers$$$$/g, "getCompatHeaders(req)")

  // Replace usage of cookies()
  content = content.replace(/cookies$$$$/g, "getCompatCookies(req)")

  // Replace dynamic imports
  content = content.replace(
    /require$$['"]next\/headers['"]$$\.headers/g,
    "require('@/lib/utils/headers').getCompatHeaders",
  )

  content = content.replace(
    /require$$['"]next\/headers['"]$$\.cookies/g,
    "require('@/lib/utils/headers').getCompatCookies",
  )

  fs.writeFileSync(filePath, content, "utf8")
  console.log(`Fixed headers import in ${filePath}`)
}

// Function to recursively scan a directory for files
function scanDirectory(dir, fileExtensions = [".js", ".jsx", ".ts", ".tsx"]) {
  const files = []

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // Skip node_modules and .next directories
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        files.push(...scanDirectory(fullPath, fileExtensions))
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (fileExtensions.includes(ext)) {
        files.push(fullPath)
      }
    }
  }

  return files
}

// Main function
function main() {
  console.log("Scanning for files with next/headers imports in pages/ directory...")

  // Check if pages directory exists
  const pagesDir = path.join(process.cwd(), "pages")
  if (!fs.existsSync(pagesDir)) {
    console.log("No pages/ directory found. Exiting.")
    return
  }

  // Scan pages directory
  const files = scanDirectory(pagesDir)

  // Check each file for headers import
  let foundIssues = false
  for (const file of files) {
    if (checkFileForHeadersImport(file)) {
      console.log(`Found next/headers import in ${file}`)
      fixFileWithHeadersImport(file)
      foundIssues = true
    }
  }

  if (!foundIssues) {
    console.log("No direct imports of next/headers found in pages/ directory.")
    console.log("Checking for indirect imports through other files...")

    // Try to build and see if there are still errors
    try {
      execSync("next build", { stdio: "inherit" })
      console.log("Build successful! All issues resolved.")
    } catch (error) {
      console.error("Build failed. There might be indirect imports of next/headers.")
      console.log("Please check the build error message for more details.")
    }
  } else {
    console.log("Fixed direct imports of next/headers. Please try building again.")
  }
}

main()
