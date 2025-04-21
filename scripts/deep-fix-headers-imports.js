const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// List of server-only modules that can cause issues
const SERVER_ONLY_MODULES = ["next/headers", "next/server-only", "server-only"]

// List of files that might be imported in pages/ directory
const potentialProblemFiles = new Set()

// Function to check if a file imports any server-only modules
function checkFileForServerOnlyImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")

    // Check for direct imports of server-only modules
    for (const module of SERVER_ONLY_MODULES) {
      if (
        content.includes(`from '${module}'`) ||
        content.includes(`from "${module}"`) ||
        content.includes(`require('${module}')`) ||
        content.includes(`require("${module}")`)
      ) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message)
    return false
  }
}

// Function to fix a file with server-only imports
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8")
    let modified = false

    // Replace direct imports
    if (content.includes("next/headers")) {
      // Replace headers import
      content = content.replace(
        /import\s+\{\s*headers(?:,\s*cookies)?\s*\}\s+from\s+['"]next\/headers['"]/g,
        "import { getCompatHeaders, getCompatCookies } from '@/lib/compat/universal-headers'",
      )

      // Replace cookies import if not included above
      content = content.replace(
        /import\s+\{\s*cookies\s*\}\s+from\s+['"]next\/headers['"]/g,
        "import { getCompatCookies } from '@/lib/compat/universal-headers'",
      )

      // Replace usage of headers()
      content = content.replace(/headers$$$$/g, "getCompatHeaders(req)")

      // Replace usage of cookies()
      content = content.replace(/cookies$$$$/g, "getCompatCookies(req)")

      modified = true
    }

    // Replace other server-only imports
    for (const module of SERVER_ONLY_MODULES) {
      if (module !== "next/headers" && (content.includes(`from '${module}'`) || content.includes(`from "${module}"`))) {
        content = content.replace(
          new RegExp(`import\\s+.*?\\s+from\\s+['"]${module}['"]`, "g"),
          "// Server-only import removed",
        )
        modified = true
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8")
      console.log(`Fixed server-only imports in ${filePath}`)
      return true
    }

    return false
  } catch (error) {
    console.error(`Error fixing file ${filePath}:`, error.message)
    return false
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

// Function to build dependency graph
function buildDependencyGraph(files) {
  const graph = {}

  for (const file of files) {
    graph[file] = []

    try {
      const content = fs.readFileSync(file, "utf8")

      // Find all imports
      const importRegex = /from\s+['"](.+?)['"]/g
      let match

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1]

        // Skip node modules and relative imports that go outside the project
        if (!importPath.startsWith(".") && !importPath.startsWith("@/")) {
          continue
        }

        // Resolve the import path to an absolute path
        let resolvedPath

        if (importPath.startsWith("@/")) {
          // Handle aliased imports
          const srcPath = importPath.replace("@/", "")
          resolvedPath = path.resolve(process.cwd(), srcPath)
        } else {
          // Handle relative imports
          resolvedPath = path.resolve(path.dirname(file), importPath)
        }

        // Add file extensions if needed
        if (!path.extname(resolvedPath)) {
          for (const ext of [".js", ".jsx", ".ts", ".tsx"]) {
            const pathWithExt = resolvedPath + ext
            if (fs.existsSync(pathWithExt)) {
              resolvedPath = pathWithExt
              break
            }

            // Check for index files
            const indexPath = path.join(resolvedPath, `index${ext}`)
            if (fs.existsSync(indexPath)) {
              resolvedPath = indexPath
              break
            }
          }
        }

        // Add to graph if the file exists
        if (fs.existsSync(resolvedPath) && files.includes(resolvedPath)) {
          graph[file].push(resolvedPath)
        }
      }
    } catch (error) {
      console.error(`Error building dependency graph for ${file}:`, error.message)
    }
  }

  return graph
}

// Function to find all files that directly or indirectly depend on server-only modules
function findAllAffectedFiles(graph, serverOnlyFiles) {
  const affected = new Set(serverOnlyFiles)
  let size

  // Keep adding files until no more are added
  do {
    size = affected.size

    for (const [file, dependencies] of Object.entries(graph)) {
      if (!affected.has(file)) {
        for (const dep of dependencies) {
          if (affected.has(dep)) {
            affected.add(file)
            break
          }
        }
      }
    }
  } while (size !== affected.size)

  return Array.from(affected)
}

// Main function
function main() {
  console.log("Starting deep fix for next/headers imports...")

  // Check if pages directory exists
  const pagesDir = path.join(process.cwd(), "pages")
  const hasPages = fs.existsSync(pagesDir)

  if (hasPages) {
    console.log("Found pages/ directory. Scanning for issues...")
  } else {
    console.log("No pages/ directory found. Scanning entire project for server-only imports...")
  }

  // Scan the entire project
  const allFiles = scanDirectory(process.cwd())
  console.log(`Found ${allFiles.length} files to analyze.`)

  // Find files with direct server-only imports
  const serverOnlyFiles = allFiles.filter((file) => checkFileForServerOnlyImports(file))
  console.log(`Found ${serverOnlyFiles.length} files with direct server-only imports.`)

  // Build dependency graph
  console.log("Building dependency graph...")
  const graph = buildDependencyGraph(allFiles)

  // Find all affected files
  console.log("Finding all affected files...")
  const affectedFiles = findAllAffectedFiles(graph, serverOnlyFiles)
  console.log(`Found ${affectedFiles.length} files affected by server-only imports.`)

  // Create universal headers compatibility file if it doesn't exist
  const compatDir = path.join(process.cwd(), "lib", "compat")
  if (!fs.existsSync(compatDir)) {
    fs.mkdirSync(compatDir, { recursive: true })
  }

  const universalHeadersPath = path.join(compatDir, "universal-headers.ts")
  if (!fs.existsSync(universalHeadersPath)) {
    console.log("Creating universal headers compatibility file...")
    const universalHeadersContent = `
// Universal headers compatibility layer
// Works in both client and server, App Router and Pages Router

import type { NextApiRequest } from 'next';

// Safe alternative to headers() from next/headers
export function getCompatHeaders(req?: NextApiRequest) {
  // If we're in a browser environment, return empty headers
  if (typeof window !== 'undefined') {
    return new Map();
  }

  // If we have a request object (Pages API routes), use it
  if (req) {
    const headers = new Map();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        headers.set(key, value.join(', '));
      }
    });
    return headers;
  }

  // Try to use App Router headers() if available
  try {
    // Only attempt to use headers() in a server context
    if (typeof window === 'undefined') {
      const { headers } = require('next/headers');
      return headers();
    }
  } catch (e) {
    console.warn('Failed to import next/headers:', e);
  }

  // Fallback to empty headers
  return new Map();
}

// Safe alternative to cookies() from next/headers
export function getCompatCookies(req?: NextApiRequest) {
  // If we're in a browser environment, return empty cookies
  if (typeof window !== 'undefined') {
    return {
      get: () => undefined,
      getAll: () => [],
    };
  }

  // If we have a request object (Pages API routes), use it
  if (req) {
    const cookies = new Map();
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      cookieHeader.split(';').forEach((cookie) => {
        const [name, ...rest] = cookie.trim().split('=');
        cookies.set(name, rest.join('='));
      });
    }

    return {
      get: (name: string) => cookies.has(name) ? { name, value: cookies.get(name) } : undefined,
      getAll: () => Array.from(cookies.entries()).map(([name, value]) => ({ name, value })),
    };
  }

  // Try to use App Router cookies() if available
  try {
    // Only attempt to use cookies() in a server context
    if (typeof window === 'undefined') {
      const { cookies } = require('next/headers');
      return cookies();
    }
  } catch (e) {
    console.warn('Failed to import next/cookies:', e);
  }

  // Fallback to empty cookies
  return {
    get: () => undefined,
    getAll: () => [],
  };
}
`
    fs.writeFileSync(universalHeadersPath, universalHeadersContent, "utf8")
  }

  // Fix all affected files
  console.log("Fixing affected files...")
  let fixedCount = 0
  for (const file of affectedFiles) {
    if (fixFile(file)) {
      fixedCount++
    }
  }
  console.log(`Fixed ${fixedCount} files.`)

  // Check middleware
  const middlewarePath = path.join(process.cwd(), "middleware.ts")
  if (fs.existsSync(middlewarePath)) {
    console.log("Checking middleware...")
    if (checkFileForServerOnlyImports(middlewarePath)) {
      fixFile(middlewarePath)
      console.log("Fixed middleware.ts")
    }
  }

  console.log("Deep fix complete. Please try building again.")
}

main()
