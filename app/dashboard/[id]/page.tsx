import { getTestPreviewLink } from "@/lib/services/test-service"
import { TestPreviewLink } from "@/components/test-preview-link"

async function DashboardIdPage({ params }: { params: { id: string } }) {
  // Assume we are fetching test data here, replace with actual data fetching logic
  // const testData = await getTestData(params.id);

  const { previewToken } = await getTestPreviewLink(params.id)

  return (
    <div>
      <h1>Dashboard ID Page: {params.id}</h1>
      {/* Display test data here, replace with actual data display */}
      <p>This is a placeholder for the test data.</p>

      <div className="mt-6">
        <TestPreviewLink testId={params.id} previewToken={previewToken} />
      </div>
    </div>
  )
}

export default DashboardIdPage
