-- Candidates table policies
-- Allow authenticated users to view candidates they've invited
CREATE POLICY "Users can view candidates they've invited"
ON candidates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM invitations
    JOIN tests ON invitations.test_id = tests.id
    WHERE invitations.candidate_id = candidates.id
    AND tests.created_by = auth.uid()
  )
);

-- Allow authenticated users to create candidates
CREATE POLICY "Users can create candidates"
ON candidates FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow service role to manage candidates
CREATE POLICY "Service role can manage candidates"
ON candidates
USING (auth.role() = 'service_role');
