import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PostContent from '@/components/blog/PostContent';
import StructuredData from '@/components/StructuredData';
import { getPostBySlug, getPublishedPosts } from '@/lib/blog';
import { generatePostMetadata, generatePostJsonLd, generateBreadcrumbJsonLd, siteConfig } from '@/lib/seo';

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
        title: 'Post Not Found',
        description: 'The requested blog post could not be found.',
      };
    }

    return generatePostMetadata(post);
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
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

    // Generate structured data
    const postJsonLd = generatePostJsonLd(post);
    const breadcrumbJsonLd = generateBreadcrumbJsonLd([
      { name: 'Home', url: siteConfig.url },
      { name: post.title, url: `${siteConfig.url}/${post.slug}` },
    ]);

    return (
      <>
        <StructuredData data={postJsonLd} />
        <StructuredData data={breadcrumbJsonLd} />
        <PostContent post={post} />
      </>
    );
  } catch (error) {
    console.error('Error loading post:', error);
    notFound();
  }
}
