-- Row Level Security (RLS) Policies for Minimalist Blog Platform

-- Enable RLS on tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Admin full access to posts" ON posts;
DROP POLICY IF EXISTS "Anyone can subscribe" ON subscribers;
DROP POLICY IF EXISTS "Admin can view subscribers" ON subscribers;

-- POSTS TABLE POLICIES

-- 1. Public read access for published posts
CREATE POLICY "Public posts are viewable by everyone" ON posts
  FOR SELECT 
  USING (published_at IS NOT NULL);

-- 2. Admin full access to posts (requires authentication)
-- Note: In production, you might want to create a specific admin role
CREATE POLICY "Admin full access to posts" ON posts
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Alternative: If you want to use a specific admin role
-- First create the admin role and assign users to it
-- CREATE POLICY "Admin full access to posts" ON posts
--   FOR ALL 
--   USING (auth.jwt() ->> 'role' = 'admin')
--   WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- SUBSCRIBERS TABLE POLICIES

-- 1. Anyone can subscribe (insert only)
CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT 
  WITH CHECK (true);

-- 2. Admin can view all subscribers
CREATE POLICY "Admin can view subscribers" ON subscribers
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- 3. Admin can update subscribers (for managing subscriptions)
CREATE POLICY "Admin can update subscribers" ON subscribers
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 4. Admin can delete subscribers (for GDPR compliance)
CREATE POLICY "Admin can delete subscribers" ON subscribers
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- ADDITIONAL SECURITY FUNCTIONS

-- Function to check if user is admin (for use in policies)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated and has admin role
  -- Adjust this logic based on your authentication setup
  RETURN auth.role() = 'authenticated' AND 
         (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'email' LIKE '%@yourdomain.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user email (useful for logging)
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.jwt() ->> 'email';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- AUDIT LOGGING (Optional but recommended for production)

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    operation,
    old_data,
    new_data,
    user_email
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    get_current_user_email()
  );
  
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for posts (admin actions only)
DROP TRIGGER IF EXISTS posts_audit_trigger ON posts;
CREATE TRIGGER posts_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON posts
  FOR EACH ROW
  WHEN (auth.role() = 'authenticated')
  EXECUTE FUNCTION audit_trigger();

-- Create audit triggers for subscribers (for GDPR compliance)
DROP TRIGGER IF EXISTS subscribers_audit_trigger ON subscribers;
CREATE TRIGGER subscribers_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON subscribers
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger();

-- PERFORMANCE AND SECURITY VIEWS

-- Create a view for published posts (commonly used query)
CREATE OR REPLACE VIEW published_posts AS
SELECT 
  id,
  title,
  content,
  slug,
  published_at,
  created_at,
  updated_at,
  tags,
  meta_description,
  reading_time
FROM posts 
WHERE published_at IS NOT NULL
ORDER BY published_at DESC;

-- Create a view for active subscribers count (admin only)
CREATE OR REPLACE VIEW subscriber_stats AS
SELECT 
  COUNT(*) as total_subscribers,
  COUNT(*) FILTER (WHERE active = true) as active_subscribers,
  COUNT(*) FILTER (WHERE subscribed_at > NOW() - INTERVAL '30 days') as recent_subscribers,
  COUNT(*) FILTER (WHERE source = 'website') as website_subscribers
FROM subscribers;

-- Grant appropriate permissions
-- Note: Supabase handles most permissions automatically, but you can add custom ones here

-- Example: Grant select on views to authenticated users
-- GRANT SELECT ON published_posts TO authenticated;
-- GRANT SELECT ON subscriber_stats TO authenticated;

-- TESTING QUERIES (Run these to verify RLS is working)

-- Test 1: Public should see only published posts
-- SELECT * FROM posts; -- Should only return published posts

-- Test 2: Public should be able to subscribe
-- INSERT INTO subscribers (email) VALUES ('test@example.com'); -- Should work

-- Test 3: Public should NOT see subscribers
-- SELECT * FROM subscribers; -- Should fail or return empty

-- Test 4: Admin should see all posts
-- (Run as authenticated user) SELECT * FROM posts; -- Should return all posts

-- Test 5: Admin should see all subscribers  
-- (Run as authenticated user) SELECT * FROM subscribers; -- Should return all subscribers