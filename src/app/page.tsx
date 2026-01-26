import PostCard from '@/components/blog/PostCard';
import { Post } from '@/lib/types';

// Sample posts for demonstration (in production, these would come from Supabase)
const samplePosts: Post[] = [
  {
    id: '1',
    title: 'The Power of Minimalism in Digital Design',
    content: `In a world cluttered with notifications, pop-ups, and endless distractions, there's something profoundly powerful about embracing minimalism in digital design.

This isn't about being sparse for the sake of it. It's about creating space for what matters most: your ideas, your words, your connection with the reader.

When you strip away the unnecessary, what remains is pure intention. Every element serves a purpose. Every word carries weight. Every moment of white space allows the reader to breathe, to think, to absorb.

The best blogs don't compete for attention—they earn it through clarity, consistency, and respect for the reader's time and intelligence.`,
    slug: 'power-of-minimalism-digital-design',
    published_at: '2024-01-26T10:00:00Z',
    created_at: '2024-01-26T09:00:00Z',
    updated_at: '2024-01-26T09:00:00Z',
    tags: ['design', 'minimalism', 'digital'],
    reading_time: 3,
  },
  {
    id: '2',
    title: 'Why Full Content Matters',
    content: `"Read more" buttons are a relic of an era when page views mattered more than reader experience.

When you force someone to click to continue reading, you're asking them to make a commitment before they know if your content is worth their time. You're creating friction where there should be flow.

Instead, present your complete thoughts. Trust your reader to engage with ideas that resonate and scroll past those that don't. Respect their ability to curate their own experience.

The goal isn't to maximize clicks—it's to maximize impact. And impact comes from ideas that are fully formed, completely shared, and genuinely useful.`,
    slug: 'why-full-content-matters',
    published_at: '2024-01-25T14:30:00Z',
    created_at: '2024-01-25T13:30:00Z',
    updated_at: '2024-01-25T13:30:00Z',
    tags: ['content', 'ux', 'writing'],
    reading_time: 2,
  },
  {
    id: '3',
    title: 'Building for Speed and Substance',
    content: `Performance isn't just about technical metrics—it's about respect for your reader's time and attention.

When your blog loads instantly, when navigation is intuitive, when the reading experience is seamless, you're sending a message: "Your time is valuable, and I've designed this experience with that in mind."

Static site generation, thoughtful caching, optimized images—these aren't just technical choices. They're editorial choices. They're statements about what you value and how you want to serve your audience.

The fastest websites aren't necessarily the most technically complex. Often, they're the most thoughtfully simple. They load quickly because they only include what's essential.

Speed enables substance. When technical barriers disappear, ideas can flow freely from writer to reader. That's the goal: frictionless transmission of meaningful ideas.`,
    slug: 'building-for-speed-and-substance',
    published_at: '2024-01-24T16:15:00Z',
    created_at: '2024-01-24T15:15:00Z',
    updated_at: '2024-01-24T15:15:00Z',
    tags: ['performance', 'web development', 'user experience'],
    reading_time: 4,
  },
];

export default function Home() {
  return (
    <div className="space-y-0">
      {samplePosts.map((post, index) => (
        <PostCard 
          key={post.id} 
          post={post} 
          showDivider={index < samplePosts.length - 1}
        />
      ))}
    </div>
  );
}
