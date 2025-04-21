-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS company_industry TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

-- Add deadline column to tests table
ALTER TABLE tests
ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;

-- Add deadline column to invitations table
ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;

-- Update RLS policies for profiles
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Update RLS policies for invitations with deadline
CREATE POLICY "Invitations are viewable by the test creator"
ON invitations
FOR SELECT
USING (
  test_id IN (
    SELECT id FROM tests WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Invitations are insertable by the test creator"
ON invitations
FOR INSERT
WITH CHECK (
  test_id IN (
    SELECT id FROM tests WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Invitations are updatable by the test creator"
ON invitations
FOR UPDATE
USING (
  test_id IN (
    SELECT id FROM tests WHERE created_by = auth.uid()
  )
);
