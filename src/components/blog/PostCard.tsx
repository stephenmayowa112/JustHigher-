'use client';

import { PostCardProps } from '@/lib/types';
import { formatDate, calculateReadingTime } from '@/lib/utils';
import ShareButtons from './ShareButtons';
import { siteConfig } from '@/lib/seo';

export default function PostCard({ post, showDivider = true }: PostCardProps) {
  const readingTime = post.reading_time || calculateReadingTime(post.content);
  const publishedDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);
  const postUrl = `${siteConfig.url}/${post.slug}`;

  return (
    <>
      <article className="space-y-6 hover:bg-blue-50/30 transition-colors duration-200 rounded-lg p-6 -mx-6">
        {/* Post Header */}
        <header className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight tracking-tight hover:text-blue-700 transition-colors">
            <a href={`/${post.slug}`}>{post.title}</a>
          </h1>
          
          {/* Tags only */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Post Content */}
        <div className="prose-seth">
          <div 
            dangerouslySetInnerHTML={{ __html: formatPostContent(post.content) }}
          />
        </div>

        {/* Post Metadata - AFTER Content */}
        <footer className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-full border border-gray-200">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time dateTime={post.published_at || post.created_at} className="text-gray-700 font-medium">
                {formatDate(publishedDate.toISOString())}
              </time>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-green-50 rounded-full border border-gray-200">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 font-medium">{readingTime} min read</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="pt-2">
            <ShareButtons 
              title={post.title}
              url={postUrl}
              description={post.meta_description || post.content.slice(0, 155)}
            />
          </div>
        </footer>
      </article>

      {/* Post Divider */}
      {showDivider && (
        <div className="post-divider" />
      )}
    </>
  );
}

/**
 * Format post content for display
 * Converts markdown-like formatting to HTML and ensures proper paragraph structure
 */
function formatPostContent(content: string): string {
  // Split content into paragraphs
  const paragraphs = content
    .split('\n\n')
    .filter(p => p.trim().length > 0)
    .map(p => p.trim());

  // Convert each paragraph to HTML
  const htmlParagraphs = paragraphs.map(paragraph => {
    // Handle headings
    if (paragraph.startsWith('# ')) {
      return `<h1>${paragraph.slice(2)}</h1>`;
    }
    if (paragraph.startsWith('## ')) {
      return `<h2>${paragraph.slice(3)}</h2>`;
    }
    if (paragraph.startsWith('### ')) {
      return `<h3>${paragraph.slice(4)}</h3>`;
    }

    // Handle bold text
    let formattedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text
    formattedParagraph = formattedParagraph.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle links
    formattedParagraph = formattedParagraph.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g, 
      '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
    );

    // Return as paragraph
    return `<p>${formattedParagraph}</p>`;
  });

  return htmlParagraphs.join('');
}