-- Invitations table policies
-- Allow users to view invitations for their tests
CREATE POLICY "Users can view invitations for their tests"
ON invitations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = invitations.test_id
    AND tests.created_by = auth.uid()
  )
);

-- Allow users to create invitations for their tests
CREATE POLICY "Users can create invitations for their tests"
ON invitations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = invitations.test_id
    AND tests.created_by = auth.uid()
  )
);

-- Allow users to update invitations for their tests
CREATE POLICY "Users can update invitations for their tests"
ON invitations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = invitations.test_id
    AND tests.created_by = auth.uid()
  )
);

-- Allow public access to invitations by token (for candidates)
CREATE POLICY "Public can access invitations by token"
ON invitations FOR SELECT
USING (true);
