const fs = require("fs")
const path = require("path")

function main() {
  const pagesDir = path.join(process.cwd(), "pages")

  if (fs.existsSync(pagesDir)) {
    console.log("Found pages/ directory. Contents:")

    function listFiles(dir, indent = "") {
      const items = fs.readdirSync(dir, { withFileTypes: true })

      for (const item of items) {
        const fullPath = path.join(dir, item.name)

        if (item.isDirectory()) {
          console.log(`${indent}📁 ${item.name}/`)
          listFiles(fullPath, indent + "  ")
        } else {
          console.log(`${indent}📄 ${item.name}`)
        }
      }
    }

    listFiles(pagesDir)

    console.log("\nThe pages/ directory is using the Pages Router, which does not support Server Components.")
    console.log("You need to ensure no server-only modules like next/headers are imported in these files.")
    console.log("\nOptions:")
    console.log("1. Run the deep-fix-headers-imports.js script to automatically fix issues")
    console.log("2. Migrate these pages to the App Router (move to app/ directory)")
    console.log("3. Remove the pages/ directory if it's not needed")
  } else {
    console.log("No pages/ directory found in this project.")
    console.log("This suggests you're using the App Router exclusively.")
    console.log("\nIf you're still seeing errors about next/headers in pages/:")
    console.log("1. Check if there's a hidden or misnamed pages directory")
    console.log("2. Check if your build process is creating a pages directory")
    console.log("3. Run the deep-fix-headers-imports.js script to find all problematic imports")
  }
}

main()
