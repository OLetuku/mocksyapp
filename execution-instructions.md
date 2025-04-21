# Supabase RLS Policy Implementation Instructions

This document provides instructions for implementing Row Level Security (RLS) policies in your Supabase project for the ReelTest application.

## How to Execute These Policies

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. You can either:
   - Execute the combined SQL file (`combined-policies.sql`) to apply all policies at once
   - Execute individual policy files for each table if you want to implement them gradually

## Important Notes

- These policies assume that RLS has already been enabled on all tables
- The policies are designed to work with the current database schema
- Some policies rely on the existence of relationships between tables
- The `auth.uid()` function is used to get the current authenticated user's ID
- The `auth.role()` function is used to check if the request is coming from a service role

## Service Role Functions

The `api-service-role-function.sql` file contains functions that can be used by your server-side API to bypass RLS for specific operations. These functions use the `SECURITY DEFINER` attribute, which means they execute with the permissions of the function creator (typically the database owner) rather than the caller.

## Testing the Policies

After implementing these policies, you should test them to ensure they work as expected:

1. Test user access to their own resources
2. Test user inability to access other users' resources
3. Test candidate access to tests they've been invited to
4. Test the API service role functions

## Troubleshooting

If you encounter permission issues after implementing these policies:

1. Check that the policy conditions match your application's logic
2. Verify that the relationships between tables are correctly defined
3. Consider using the Supabase client with the service role key for administrative operations
4. Use the API service role functions for operations that need to bypass RLS
