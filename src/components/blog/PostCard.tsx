import { PostCardProps } from '@/lib/types';
import { formatDate, calculateReadingTime } from '@/lib/utils';

export default function PostCard({ post, showDivider = true }: PostCardProps) {
  const readingTime = post.reading_time || calculateReadingTime(post.content);
  const publishedDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);

  return (
    <>
      <article className="space-y-6">
        {/* Post Header */}
        <header className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight tracking-tight">
            {post.title}
          </h1>
          
          {/* Post Metadata */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500">
            <time dateTime={post.published_at || post.created_at}>
              {formatDate(publishedDate.toISOString())}
            </time>
            <span className="hidden sm:inline">•</span>
            <span>{readingTime} min read</span>
            {post.tags && post.tags.length > 0 && (
              <>
                <span className="hidden sm:inline">•</span>
                <div className="flex flex-wrap items-center gap-2">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Post Content */}
        <div className="prose-seth">
          <div 
            dangerouslySetInnerHTML={{ __html: formatPostContent(post.content) }}
          />
        </div>
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