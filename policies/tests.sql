-- Tests table policies
-- Allow users to read their own tests
CREATE POLICY "Users can view their own tests"
ON tests FOR SELECT
USING (auth.uid() = created_by);

-- Allow users to create their own tests
CREATE POLICY "Users can create tests"
ON tests FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own tests
CREATE POLICY "Users can update their own tests"
ON tests FOR UPDATE
USING (auth.uid() = created_by);

-- Allow users to delete their own tests
CREATE POLICY "Users can delete their own tests"
ON tests FOR DELETE
USING (auth.uid() = created_by);
