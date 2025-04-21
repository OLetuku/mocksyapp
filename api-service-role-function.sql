-- Create a function that can be used by the API service role
-- This function allows the API to bypass RLS for specific operations

CREATE OR REPLACE FUNCTION create_test_settings(
  p_test_id UUID,
  p_watermark BOOLEAN,
  p_prevent_skipping BOOLEAN,
  p_limit_attempts BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO test_settings (
    test_id,
    watermark,
    prevent_skipping,
    limit_attempts,
    created_at,
    updated_at
  ) VALUES (
    p_test_id,
    p_watermark,
    p_prevent_skipping,
    p_limit_attempts,
    NOW(),
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update test settings
CREATE OR REPLACE FUNCTION update_test_settings(
  p_test_id UUID,
  p_watermark BOOLEAN,
  p_prevent_skipping BOOLEAN,
  p_limit_attempts BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  UPDATE test_settings
  SET
    watermark = p_watermark,
    prevent_skipping = p_prevent_skipping,
    limit_attempts = p_limit_attempts,
    updated_at = NOW()
  WHERE test_id = p_test_id;
  
  -- If no row was updated, insert a new one
  IF NOT FOUND THEN
    INSERT INTO test_settings (
      test_id,
      watermark,
      prevent_skipping,
      limit_attempts,
      created_at,
      updated_at
    ) VALUES (
      p_test_id,
      p_watermark,
      p_prevent_skipping,
      p_limit_attempts,
      NOW(),
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
