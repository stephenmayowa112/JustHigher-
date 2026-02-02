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
  const postUrl = `${siteConfig.url}/${post.slug}`;

  return (
    <article className="space-y-8">
      {/* Post Header */}
      <header className="space-y-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent leading-tight tracking-tight">
          {post.title}
        </h1>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200 shadow-sm"
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

      {/* Post Metadata - After Content */}
      <div className="flex items-center justify-center space-x-4 text-sm pt-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-full border border-gray-200">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <time dateTime={post.published_at || post.created_at} className="text-gray-700 font-medium">
            {formatDate(publishedDate.toISOString())}
          </time>
        </div>
        <span className="text-gray-400">•</span>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-green-50 rounded-full border border-gray-200">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-700 font-medium">{readingTime} min read</span>
        </div>
      </div>

      {/* Shareable Link Section */}
      <div className="pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-100 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Share this post</h3>
              <p className="text-xs text-gray-600 mb-3">Help others discover this content</p>
              <ShareButtons 
                title={post.title}
                url={postUrl}
                description={post.meta_description || post.content.slice(0, 155)}
              />
              <div className="mt-4 pt-4 border-t border-blue-200">
                <label htmlFor="post-url-input" className="text-xs font-medium text-gray-700 block mb-2">Direct link to this post:</label>
                <div className="flex items-center gap-2">
                  <input
                    id="post-url-input"
                    type="text"
                    readOnly
                    value={postUrl}
                    className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    onClick={(e) => e.currentTarget.select()}
                    aria-label="Post URL"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(postUrl);
                      alert('Link copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Footer */}
      <footer className="pt-8 border-t border-gray-200">
        <div className="text-center space-y-4">
          {/* Back to home link */}
          <div>
            <a 
              href="/"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all posts
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
      return `<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-4">${paragraph.slice(2)}</h1>`;
    }
    if (paragraph.startsWith('## ')) {
      return `<h2 class="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mt-6 mb-3">${paragraph.slice(3)}</h2>`;
    }
    if (paragraph.startsWith('### ')) {
      return `<h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">${paragraph.slice(4)}</h3>`;
    }

    // Handle bold text
    let formattedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    
    // Handle italic text
    formattedParagraph = formattedParagraph.replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>');
    
    // Handle links
    formattedParagraph = formattedParagraph.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g, 
      '<a href="$2" class="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors">$1</a>'
    );

    // Return as paragraph
    return `<p class="text-gray-700 leading-relaxed">${formattedParagraph}</p>`;
  });

  return htmlParagraphs.join('');
}