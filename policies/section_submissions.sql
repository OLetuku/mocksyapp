-- Section submissions table policies
-- Allow users to view section submissions for their tests
CREATE POLICY "Users can view section submissions for their tests"
ON section_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM test_submissions
    JOIN tests ON test_submissions.test_id = tests.id
    WHERE test_submissions.id = section_submissions.test_submission_id
    AND tests.created_by = auth.uid()
  )
);

-- Allow candidates to create section submissions for their test submissions
CREATE POLICY "Candidates can create section submissions"
ON section_submissions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM test_submissions
    JOIN invitations ON test_submissions.test_id = invitations.test_id
    WHERE test_submissions.id = section_submissions.test_submission_id
    AND test_submissions.candidate_id = invitations.candidate_id
  )
);

-- Allow candidates to update their own section submissions
CREATE POLICY "Candidates can update their own section submissions"
ON section_submissions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM test_submissions
    JOIN invitations ON test_submissions.test_id = invitations.test_id
    WHERE test_submissions.id = section_submissions.test_submission_id
    AND test_submissions.candidate_id = invitations.candidate_id
  )
);

-- Allow service role to manage section submissions
CREATE POLICY "Service role can manage section submissions"
ON section_submissions
USING (auth.role() = 'service_role');
