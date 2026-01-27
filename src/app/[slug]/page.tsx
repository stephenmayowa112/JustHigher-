import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PostContent, { generatePostMetadata } from '@/components/blog/PostContent';
import { getPostBySlug, getPublishedPosts } from '@/lib/blog';

interface PostPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all published posts
export async function generateStaticParams() {
  try {
    // Fetch all published posts from Supabase
    const posts = await getPublishedPosts();
    
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    
    // Fallback to sample posts if Supabase is not configured
    return [
      { slug: 'power-of-minimalism-digital-design' },
      { slug: 'why-full-content-matters' },
      { slug: 'building-for-speed-and-substance' },
      { slug: 'welcome-to-your-minimalist-blog' },
    ];
  }
}

// Generate metadata for each post
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  try {
    const post = await getPostBySlug(params.slug);
    
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
    const post = await getPostBySlug(params.slug);

    if (!post) {
      notFound();
    }

    return <PostContent post={post} />;
  } catch (error) {
    console.error('Error loading post:', error);
    notFound();
  }
}