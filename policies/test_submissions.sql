-- Test submissions table policies
-- Allow users to view submissions for their tests
CREATE POLICY "Users can view submissions for their tests"
ON test_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_submissions.test_id
    AND tests.created_by = auth.uid()
  )
);

-- Allow candidates to create submissions for tests they're invited to
CREATE POLICY "Candidates can create submissions for invited tests"
ON test_submissions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM invitations
    WHERE invitations.test_id = test_submissions.test_id
    AND invitations.candidate_id = test_submissions.candidate_id
    AND invitations.status = 'pending'
  )
);

-- Allow candidates to update their own submissions
CREATE POLICY "Candidates can update their own submissions"
ON test_submissions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM invitations
    WHERE invitations.test_id = test_submissions.test_id
    AND invitations.candidate_id = test_submissions.candidate_id
  )
);

-- Allow service role to manage submissions
CREATE POLICY "Service role can manage submissions"
ON test_submissions
USING (auth.role() = 'service_role');
