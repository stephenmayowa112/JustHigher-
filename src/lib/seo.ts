import { Metadata } from 'next';
import { Post } from './types';

// Site configuration
export const siteConfig = {
  name: 'JustHigher Blog',
  description: 'Ideas that elevate, inspire, and push you toward your potential. A place for dreamers who do, thinkers who act.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  ogImage: '/og-image.jpg',
  twitterHandle: '@justhigher',
  author: {
    name: 'JustHigher',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  },
};

/**
 * Generate default metadata for the site
 */
export function generateDefaultMetadata(): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [
      'blog',
      'inspiration',
      'motivation',
      'personal growth',
      'self-improvement',
      'mindset',
      'success',
      'productivity',
    ],
    authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
    creator: siteConfig.author.name,
    publisher: siteConfig.author.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteConfig.url,
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description: siteConfig.description,
      creator: siteConfig.twitterHandle,
      images: [siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // Add your verification codes here
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
      // bing: 'your-bing-verification-code',
    },
  };
}

/**
 * Generate metadata for blog post pages
 */
export function generatePostMetadata(post: Post): Metadata {
  const publishedDate = post.published_at
    ? new Date(post.published_at)
    : new Date(post.created_at);
  
  const description = post.meta_description || 
    `${post.content.slice(0, 155)}...`;
  
  const postUrl = `${siteConfig.url}/${post.slug}`;
  
  return {
    title: post.title,
    description,
    keywords: post.tags,
    authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: postUrl,
      title: post.title,
      description,
      siteName: siteConfig.name,
      publishedTime: publishedDate.toISOString(),
      modifiedTime: new Date(post.updated_at).toISOString(),
      authors: [siteConfig.author.name],
      tags: post.tags,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      creator: siteConfig.twitterHandle,
      images: [siteConfig.ogImage],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

/**
 * Generate JSON-LD structured data for blog posts
 */
export function generatePostJsonLd(post: Post) {
  const publishedDate = post.published_at
    ? new Date(post.published_at)
    : new Date(post.created_at);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.content.slice(0, 155),
    image: siteConfig.ogImage,
    datePublished: publishedDate.toISOString(),
    dateModified: new Date(post.updated_at).toISOString(),
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/${post.slug}`,
    },
    keywords: post.tags?.join(', '),
    articleBody: post.content,
  };
}

/**
 * Generate JSON-LD structured data for the website
 */
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [
      // Add your social media profiles here
      // 'https://twitter.com/justhigher',
      // 'https://facebook.com/justhigher',
      // 'https://instagram.com/justhigher',
    ],
  };
}

/**
 * Generate breadcrumb JSON-LD
 */
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
