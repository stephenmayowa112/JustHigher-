import PostCard from '@/components/blog/PostCard';
import { getPublishedPosts } from '@/lib/blog';
import { Post } from '@/lib/types';

// This page uses Server-Side Generation to fetch posts at build time
export default async function Home() {
  let posts: Post[] = [];
  
  try {
    // Fetch published posts from Supabase
    posts = await getPublishedPosts(20); // Get latest 20 posts
  } catch (error) {
    console.error('Error fetching posts:', error);
    
    // Fallback to sample data if database is not configured
    posts = [
      {
        id: '1',
        title: 'Welcome to JustHigher Blog',
        content: `Welcome to JustHigher Blog—a place for ideas that elevate, inspire, and push you toward your potential.

This isn't about perfection. It's about progress. It's about the daily choice to aim higher than yesterday, to think deeper than the surface, to act with intention rather than impulse.

Here, we explore what it means to live deliberately. To choose growth over comfort. To embrace the discomfort that comes with becoming who you're meant to be.

## What You'll Find Here

Ideas that challenge conventional thinking. Perspectives that push you beyond your comfort zone. Stories that remind you what's possible when you refuse to settle.

This is for the dreamers who do. The thinkers who act. The people who believe that where you are today doesn't have to be where you stay.

## The Journey Up

Every day, you have a choice: stay where you are or climb a little higher. The path isn't always clear. The climb isn't always easy. But the view from higher ground is always worth it.

This is your invitation to join the journey. To think bigger. To act bolder. To go just a little higher than you did yesterday.

Welcome to the climb.`,
        slug: 'welcome-to-justhigher-blog',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['welcome', 'motivation', 'growth'],
        reading_time: 2,
      }
    ];
  }

  // If no posts are available, show a welcome message
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-block p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-6">
          <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-4">
          Welcome to JustHigher Blog
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          A place for ideas that elevate, inspire, and push you toward your potential.
        </p>
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto shadow-sm">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            The Journey Begins:
          </h2>
          <p className="text-blue-800">
            Every day, you have a choice: stay where you are or climb a little higher. 
            This is your invitation to join the journey toward becoming who you're meant to be.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {posts.map((post, index) => (
        <PostCard 
          key={post.id} 
          post={post} 
          showDivider={index < posts.length - 1}
        />
      ))}
    </div>
  );
}
