import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PostContent, { generatePostMetadata } from '@/components/blog/PostContent';
import { getPostBySlug, getPublishedPosts } from '@/lib/blog';
import { Post } from '@/lib/types';

interface PostPageProps {
  params: {
    slug: string;
  };
}

// Sample posts for development (in production, this would come from Supabase)
const samplePosts: Post[] = [
  {
    id: '1',
    title: 'The Power of Minimalism in Digital Design',
    content: `In a world cluttered with notifications, pop-ups, and endless distractions, there's something profoundly powerful about embracing minimalism in digital design.

This isn't about being sparse for the sake of it. It's about creating space for what matters most: your ideas, your words, your connection with the reader.

When you strip away the unnecessary, what remains is pure intention. Every element serves a purpose. Every word carries weight. Every moment of white space allows the reader to breathe, to think, to absorb.

The best blogs don't compete for attention—they earn it through clarity, consistency, and respect for the reader's time and intelligence.

## The Philosophy Behind Minimalism

Minimalism in digital design isn't just an aesthetic choice—it's a philosophical stance. It's about recognizing that in our attention economy, the most valuable thing you can give your readers is clarity.

When you remove the unnecessary, you're not just cleaning up your design. You're making a statement about what you value. You're saying that your reader's time and attention are precious, and you're going to honor that by presenting only what matters.

## Practical Applications

How does this translate to practical design decisions?

**Typography**: Choose fonts that are readable, not trendy. Set line heights that give text room to breathe. Use font sizes that don't strain the eyes.

**Color**: A limited palette forces you to be intentional. When everything isn't competing for attention through color, the content itself becomes the star.

**Layout**: White space isn't empty space—it's breathing room. It's the pause between thoughts that allows ideas to land and resonate.

**Navigation**: Simple, predictable navigation means readers spend less time figuring out how to use your site and more time engaging with your ideas.

The goal isn't to impress with complexity. The goal is to communicate with clarity.`,
    slug: 'power-of-minimalism-digital-design',
    published_at: '2024-01-26T10:00:00Z',
    created_at: '2024-01-26T09:00:00Z',
    updated_at: '2024-01-26T09:00:00Z',
    tags: ['design', 'minimalism', 'digital'],
    reading_time: 5,
    meta_description: 'Exploring the power of minimalist design in creating meaningful digital experiences that prioritize clarity and user attention.',
  },
  {
    id: '2',
    title: 'Why Full Content Matters',
    content: `"Read more" buttons are a relic of an era when page views mattered more than reader experience.

When you force someone to click to continue reading, you're asking them to make a commitment before they know if your content is worth their time. You're creating friction where there should be flow.

Instead, present your complete thoughts. Trust your reader to engage with ideas that resonate and scroll past those that don't. Respect their ability to curate their own experience.

The goal isn't to maximize clicks—it's to maximize impact. And impact comes from ideas that are fully formed, completely shared, and genuinely useful.

## The Psychology of Friction

Every click is a decision point. Every decision point is an opportunity for the reader to leave. When you add unnecessary friction to the reading experience, you're essentially asking your audience to prove their interest at every step.

This approach might have made sense when advertising revenue was tied directly to page views. But in today's landscape, where trust and engagement matter more than raw traffic numbers, this strategy backfires.

## Building Trust Through Transparency

When you show your complete thoughts upfront, you're demonstrating confidence in your content. You're saying, "Here's what I have to offer. Take what's useful and leave the rest."

This transparency builds trust. Readers know they're not being manipulated or led through a funnel designed to extract maximum engagement metrics. They're being treated as intelligent humans capable of making their own decisions about what deserves their attention.

## The Seth Godin Approach

Seth Godin's blog is a masterclass in this philosophy. Every post is complete. Every idea is fully formed. There are no cliffhangers, no artificial barriers, no attempts to game the system for extra page views.

The result? A loyal readership that trusts the content because they know they're getting the full story, every time.`,
    slug: 'why-full-content-matters',
    published_at: '2024-01-25T14:30:00Z',
    created_at: '2024-01-25T13:30:00Z',
    updated_at: '2024-01-25T13:30:00Z',
    tags: ['content', 'ux', 'writing'],
    reading_time: 4,
    meta_description: 'Why showing full content instead of using "read more" buttons creates better user experiences and builds trust with readers.',
  },
  {
    id: '3',
    title: 'Building for Speed and Substance',
    content: `Performance isn't just about technical metrics—it's about respect for your reader's time and attention.

When your blog loads instantly, when navigation is intuitive, when the reading experience is seamless, you're sending a message: "Your time is valuable, and I've designed this experience with that in mind."

Static site generation, thoughtful caching, optimized images—these aren't just technical choices. They're editorial choices. They're statements about what you value and how you want to serve your audience.

The fastest websites aren't necessarily the most technically complex. Often, they're the most thoughtfully simple. They load quickly because they only include what's essential.

Speed enables substance. When technical barriers disappear, ideas can flow freely from writer to reader. That's the goal: frictionless transmission of meaningful ideas.

## The Technical Philosophy

Every technical decision should serve the reader. This means:

**Static Generation**: Pre-rendering content so it loads instantly, rather than making readers wait while servers process requests.

**Minimal JavaScript**: Only including interactive elements that genuinely improve the experience, not adding complexity for its own sake.

**Optimized Assets**: Compressing images, minifying code, and eliminating unused resources.

**Caching Strategies**: Storing frequently accessed content closer to the reader, reducing load times.

## Performance as User Experience

A slow website isn't just a technical problem—it's a user experience problem. When someone clicks on your article and has to wait three seconds for it to load, you've already communicated something about how much you value their time.

In contrast, when your content appears instantly, when scrolling is smooth, when everything just works, you've created space for ideas to flourish. The technology disappears, and the focus shifts to where it belongs: the content.

## The Compound Effect

Fast websites don't just provide better individual experiences—they create compound benefits:

- **Higher Engagement**: Readers are more likely to explore multiple articles when navigation is instant.
- **Better SEO**: Search engines favor fast-loading sites, increasing discoverability.
- **Mobile Optimization**: Speed is especially crucial on mobile devices with slower connections.
- **Accessibility**: Fast sites work better for users with disabilities who rely on assistive technologies.

The investment in performance pays dividends in every aspect of the reader experience.`,
    slug: 'building-for-speed-and-substance',
    published_at: '2024-01-24T16:15:00Z',
    created_at: '2024-01-24T15:15:00Z',
    updated_at: '2024-01-24T15:15:00Z',
    tags: ['performance', 'web development', 'user experience'],
    reading_time: 6,
    meta_description: 'How technical performance decisions impact user experience and why building fast websites is about respecting your readers.',
  },
];

// Generate static params for all published posts
export async function generateStaticParams() {
  try {
    // In production, this would fetch from Supabase
    // const posts = await getPublishedPosts();
    
    // For now, use sample posts
    const posts = samplePosts;
    
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for each post
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  try {
    // In production, this would fetch from Supabase
    // const post = await getPostBySlug(params.slug);
    
    // For now, find in sample posts
    const post = samplePosts.find(p => p.slug === params.slug);
    
    if (!post) {
      return {
        title: 'Post Not Found | Minimalist Blog',
        description: 'The requested blog post could not be found.',
      };
    }

    return generatePostMetadata(post);
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error | Minimalist Blog',
      description: 'An error occurred while loading this post.',
    };
  }
}

// Post page component
export default async function PostPage({ params }: PostPageProps) {
  try {
    // In production, this would fetch from Supabase
    // const post = await getPostBySlug(params.slug);
    
    // For now, find in sample posts
    const post = samplePosts.find(p => p.slug === params.slug);

    if (!post) {
      notFound();
    }

    return <PostContent post={post} />;
  } catch (error) {
    console.error('Error loading post:', error);
    notFound();
  }
}