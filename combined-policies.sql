-- Combined SQL file with all policies

-- Profiles table policies
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Tests table policies
CREATE POLICY "Users can view their own tests"
ON tests FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can create tests"
ON tests FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tests"
ON tests FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tests"
ON tests FOR DELETE
USING (auth.uid() = created_by);

-- Test sections table policies
CREATE POLICY "Users can view sections for their tests"
ON test_sections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_sections.test_id
    AND tests.created_by = auth.uid()
  )
);

CREATE POLICY "Users can create sections for their tests"
ON test_sections FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_sections.test_id
    AND tests.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update sections for their tests"
ON test_sections FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_sections.test_id
    AND tests.created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete sections for their tests"
ON test_sections FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_sections.test_id
    AND tests.created_by = auth.uid()
  )
);

-- Test settings table policies
CREATE POLICY "Users can view settings for their tests"
ON test_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_settings.test_id
    AND tests.created_by = auth.uid()
  )
);

CREATE POLICY "Users can create settings for their tests"
ON test_settings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_settings.test_id
    AND tests.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update settings for their tests"
ON test_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_settings.test_id
    AND tests.created_by = auth.uid()
  )
);

-- Candidates table policies
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

CREATE POLICY "Users can create candidates"
ON candidates FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage candidates"
ON candidates
USING (auth.role() = 'service_role');

-- Invitations table policies
CREATE POLICY "Users can view invitations for their tests"
ON invitations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = invitations.test_id
    AND tests.created_by = auth.uid()
  )
);

CREATE POLICY "Users can create invitations for their tests"
ON invitations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = invitations.test_id
    AND tests.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update invitations for their tests"
ON invitations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = invitations.test_id
    AND tests.created_by = auth.uid()
  )
);

CREATE POLICY "Public can access invitations by token"
ON invitations FOR SELECT
USING (true);

-- Test submissions table policies
CREATE POLICY "Users can view submissions for their tests"
ON test_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_submissions.test_id
    AND tests.created_by = auth.uid()
  )
);

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

CREATE POLICY "Candidates can update their own submissions"
ON test_submissions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM invitations
    WHERE invitations.test_id = test_submissions.test_id
    AND invitations.candidate_id = test_submissions.candidate_id
  )
);

CREATE POLICY "Service role can manage submissions"
ON test_submissions
USING (auth.role() = 'service_role');

-- Section submissions table policies
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

CREATE POLICY "Service role can manage section submissions"
ON section_submissions
USING (auth.role() = 'service_role');
