import { Post } from '@/lib/types';
import { formatDate, calculateReadingTime } from '@/lib/utils';
import ShareButtons from './ShareButtons';
import { siteConfig } from '@/lib/seo';

interface PostContentProps {
  post: Post;
}

export default function PostContent({ post }: PostContentProps) {
  const readingTime = post.reading_time || calculateReadingTime(post.content);
  const publishedDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);

  return (
    <article className="space-y-8">
      {/* Post Header */}
      <header className="space-y-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
          {post.title}
        </h1>
        
        {/* Post Metadata */}
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <time dateTime={post.published_at || post.created_at}>
            {formatDate(publishedDate.toISOString())}
          </time>
          <span>•</span>
          <span>{readingTime} min read</span>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Post Content */}
      <div className="prose-seth max-w-none">
        <div 
          dangerouslySetInnerHTML={{ __html: formatPostContent(post.content) }}
        />
      </div>

      {/* Share Buttons */}
      <div className="pt-8 border-t border-gray-200">
        <ShareButtons 
          title={post.title}
          url={`${siteConfig.url}/${post.slug}`}
          description={post.meta_description || post.content.slice(0, 155)}
        />
      </div>

      {/* Post Footer */}
      <footer className="pt-8 border-t border-gray-200">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Published on {formatDate(publishedDate.toISOString())}
          </p>
          
          {/* Back to home link */}
          <div>
            <a 
              href="/"
              className="inline-flex items-center text-sm text-gray-900 hover:text-gray-600 font-medium transition-colors"
            >
              ← Back to all posts
            </a>
          </div>
        </div>
      </footer>
    </article>
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