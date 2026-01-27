-- Minimalist Blog Platform Database Schema
-- This file contains the complete database schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  meta_description TEXT,
  reading_time INTEGER -- estimated reading time in minutes
);

-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  source TEXT DEFAULT 'website' -- tracking signup source
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(active) WHERE active = true;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for posts updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE posts IS 'Blog posts with content and metadata';
COMMENT ON COLUMN posts.slug IS 'URL-friendly identifier for the post';
COMMENT ON COLUMN posts.published_at IS 'When the post was published (NULL = draft)';
COMMENT ON COLUMN posts.reading_time IS 'Estimated reading time in minutes';
COMMENT ON COLUMN posts.tags IS 'Array of tags for categorization';

COMMENT ON TABLE subscribers IS 'Newsletter subscribers';
COMMENT ON COLUMN subscribers.source IS 'Where the subscriber signed up from';
COMMENT ON COLUMN subscribers.active IS 'Whether the subscription is active';

-- Create a function to calculate reading time
CREATE OR REPLACE FUNCTION calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
DECLARE
    word_count INTEGER;
    reading_time INTEGER;
BEGIN
    -- Count words (split by whitespace)
    SELECT array_length(string_to_array(trim(content_text), ' '), 1) INTO word_count;
    
    -- Calculate reading time (assuming 200 words per minute)
    reading_time := CEIL(word_count::FLOAT / 200);
    
    -- Minimum 1 minute
    IF reading_time < 1 THEN
        reading_time := 1;
    END IF;
    
    RETURN reading_time;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically calculate reading time
CREATE OR REPLACE FUNCTION update_reading_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reading_time := calculate_reading_time(NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_reading_time_trigger ON posts;
CREATE TRIGGER calculate_reading_time_trigger
    BEFORE INSERT OR UPDATE OF content ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_reading_time();