-- Create policy to allow access to tests via preview token
CREATE POLICY "Allow access to tests via preview token" ON tests
FOR SELECT
TO public
USING (preview_token = current_setting('request.preview_token', true)::uuid);
