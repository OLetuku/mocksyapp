-- Test settings table policies
-- Allow users to read settings for tests they own
CREATE POLICY "Users can view settings for their tests"
ON test_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_settings.test_id
    AND tests.created_by = auth.uid()
  )
);

-- Allow users to create settings for tests they own
CREATE POLICY "Users can create settings for their tests"
ON test_settings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_settings.test_id
    AND tests.created_by = auth.uid()
  )
);

-- Allow users to update settings for tests they own
CREATE POLICY "Users can update settings for their tests"
ON test_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_settings.test_id
    AND tests.created_by = auth.uid()
  )
);
