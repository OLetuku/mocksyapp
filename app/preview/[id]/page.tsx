import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import TestPreview from "@/components/test-preview"

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { token: string }
}) {
  const { id } = params
  const { token } = searchParams

  if (!token) {
    return notFound()
  }

  const supabase = createServerComponentClient({ cookies })

  // Verify the preview token
  const { data: test, error } = await supabase
    .from("tests")
    .select(`
      *,
      test_sections(*),
      test_settings(*)
    `)
    .eq("id", id)
    .eq("preview_token", token)
    .single()

  if (error || !test) {
    return notFound()
  }

  return <TestPreview test={test} />
}
