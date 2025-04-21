-- Test sections table policies
-- Allow users to read sections for tests they own
CREATE POLICY "Users can view sections for their tests"
ON test_sections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_sections.test_id
    AND tests.created_by = auth.uid()
  )
);

-- Allow users to create sections for tests they own
CREATE POLICY "Users can create sections for their tests"
ON test_sections FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_sections.test_id
    AND tests.created_by = auth.uid()
  )
);

-- Allow users to update sections for tests they own
CREATE POLICY "Users can update sections for their tests"
ON test_sections FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_sections.test_id
    AND tests.created_by = auth.uid()
  )
);

-- Allow users to delete sections for tests they own
CREATE POLICY "Users can delete sections for their tests"
ON test_sections FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_sections.test_id
    AND tests.created_by = auth.uid()
  )
);
