const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// List of server-only modules that can cause issues in pages/
const SERVER_ONLY_MODULES = ["next/headers", "next/server-only", "server-only"]

// Function to check if a file imports any server-only modules
function checkFileForServerOnlyImports(filePath) {
  const content = fs.readFileSync(filePath, "utf8")

  const issues = []

  for (const module of SERVER_ONLY_MODULES) {
    // Check for direct imports
    if (content.includes(`from '${module}'`) || content.includes(`from "${module}"`)) {
      issues.push(`Direct import of ${module}`)
    }

    // Check for dynamic imports
    if (content.includes(`require('${module}')`) || content.includes(`require("${module}")`)) {
      issues.push(`Dynamic import of ${module}`)
    }
  }

  // Check for imports from files that might use server-only modules
  const importMatches = content.match(/from\s+['"](@\/|\.\.\/|\.\/)[^'"]+['"]/g) || []
  for (const importMatch of importMatches) {
    const importPath = importMatch
      .match(/from\s+['"](@\/|\.\.\/|\.\/)[^'"]+['"]/)[0]
      .replace(/from\s+['"]/, "")
      .replace(/['"]$/, "")
    issues.push(`Potential indirect import from ${importPath}`)
  }

  return issues.length > 0 ? issues : null
}

// Function to recursively scan a directory for files
function scanDirectory(dir, fileExtensions = [".js", ".jsx", ".ts", ".tsx"]) {
  const files = []

  if (!fs.existsSync(dir)) {
    return files
  }

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
  console.log("Diagnosing potential issues in pages/ directory...")

  // Check if pages directory exists
  const pagesDir = path.join(process.cwd(), "pages")
  if (!fs.existsSync(pagesDir)) {
    console.log("No pages/ directory found.")
    console.log("Checking for other potential issues...")
  } else {
    // Scan pages directory
    const files = scanDirectory(pagesDir)

    // Check each file for server-only imports
    let foundIssues = false
    for (const file of files) {
      const issues = checkFileForServerOnlyImports(file)
      if (issues) {
        console.log(`Issues found in ${file}:`)
        for (const issue of issues) {
          console.log(`  - ${issue}`)
        }
        foundIssues = true
      }
    }

    if (!foundIssues) {
      console.log("No direct server-only imports found in pages/ directory.")
    } else {
      console.log("Found potential issues in pages/ directory. Please fix them and try building again.")
    }
  }

  // Check for other potential issues
  console.log("Checking for other potential deployment issues...")

  // Check for middleware using next/headers
  if (fs.existsSync(path.join(process.cwd(), "middleware.ts"))) {
    const middlewareContent = fs.readFileSync(path.join(process.cwd(), "middleware.ts"), "utf8")
    if (middlewareContent.includes("next/headers")) {
      console.log("Warning: middleware.ts contains imports from next/headers, which can cause issues.")
    }
  }

  // Check for API routes in app/ directory that might be imported in pages/
  const appApiDir = path.join(process.cwd(), "app", "api")
  if (fs.existsSync(appApiDir)) {
    const apiFiles = scanDirectory(appApiDir)
    console.log(`Found ${apiFiles.length} API routes in app/api directory.`)
    console.log("Make sure these are not being imported in pages/ directory files.")
  }

  console.log("Diagnosis complete. Please fix any identified issues and try building again.")
}

main()
