# Minimalist Blog Platform

A modern, high-performance blogging platform inspired by Seth Godin's minimalist design, built with Next.js 15, Supabase, and Tailwind CSS.

## Features

- **Minimalist Design**: Clean, distraction-free reading experience
- **Lightning Fast**: Static site generation for sub-1-second page loads
- **Seth Godin Inspired**: Persistent sidebar with full-content feed
- **Newsletter Integration**: Built-in email subscription system
- **Real-time Search**: Full-text search through blog posts
- **Mobile Responsive**: Optimized for all device sizes

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript
- **Styling**: Tailwind CSS with custom typography
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Authentication**: Supabase Auth (admin only)

## Quick Start

### 1. Clone and Install

```bash
cd minimalist-blog
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Update `.env.local` with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Set up Database

Run the following SQL in your Supabase SQL editor:

```sql
-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  meta_description TEXT,
  reading_time INTEGER
);

-- Create subscribers table
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  source TEXT DEFAULT 'website'
);

-- Create indexes
CREATE INDEX idx_posts_published_at ON posts(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_subscribers_email ON subscribers(email);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public posts are viewable by everyone" ON posts
  FOR SELECT USING (published_at IS NOT NULL);

CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your blog.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with Seth Godin aesthetic
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (blog feed)
│   └── [slug]/            # Dynamic blog post pages
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components (Sidebar, MainContent)
│   └── blog/              # Blog-specific components
├── lib/                   # Utility functions and configurations
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
└── styles/               # Additional styles
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run type-check` - Run TypeScript checks
- `npm run lint` - Run ESLint

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## Design Philosophy

This platform follows Seth Godin's minimalist approach:

- **Content First**: Full post content visible in feed, no "Read More" buttons
- **Distraction Free**: No comments, no sidebar clutter, no heavy animations
- **Typography Focused**: Optimized reading experience with proper line height and spacing
- **Performance Obsessed**: Static generation for instant loading

## License

MIT
