const fs = require("fs")
const path = require("path")

// List of server-only modules
const SERVER_ONLY_MODULES = ["next/headers", "next/server-only", "server-only"]

// Function to check if a file imports any server-only modules
function checkFileForServerOnlyImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")

    const issues = []

    // Check for direct imports
    for (const module of SERVER_ONLY_MODULES) {
      if (content.includes(`from '${module}'`) || content.includes(`from "${module}"`)) {
        issues.push(`Direct import of ${module}`)
      }

      if (content.includes(`require('${module}')`) || content.includes(`require("${module}")`)) {
        issues.push(`Dynamic import of ${module}`)
      }
    }

    return issues.length > 0 ? issues : null
  } catch (error) {
    return [`Error reading file: ${error.message}`]
  }
}

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

// Main function
function main() {
  console.log("Scanning all files for server-only imports...")

  // Scan the entire project
  const allFiles = scanDirectory(process.cwd())
  console.log(`Found ${allFiles.length} files to analyze.`)

  // Check each file for server-only imports
  const problemFiles = []

  for (const file of allFiles) {
    const issues = checkFileForServerOnlyImports(file)
    if (issues) {
      problemFiles.push({ file, issues })
    }
  }

  if (problemFiles.length === 0) {
    console.log("No files with server-only imports found.")
  } else {
    console.log(`Found ${problemFiles.length} files with server-only imports:`)

    for (const { file, issues } of problemFiles) {
      const relativePath = path.relative(process.cwd(), file)
      console.log(`\n${relativePath}:`)
      for (const issue of issues) {
        console.log(`  - ${issue}`)
      }
    }

    console.log("\nTo fix these issues:")
    console.log("1. Run node scripts/deep-fix-headers-imports.js")
    console.log("2. For any remaining issues, manually update the files to use the compatibility layer")
  }
}

main()
