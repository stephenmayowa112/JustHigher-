import { Post } from './types';

/**
 * Generate a branded HTML email template for a blog post newsletter.
 * All styles are inline since email clients don't support external CSS.
 */
export function generateNewsletterEmail(post: Post, unsubscribeUrl: string): string {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://justhigher.blog';
    const postUrl = `${siteUrl}/${post.slug}`;

    // Truncate content to ~300 chars for preview, strip HTML tags
    const contentPreview = (post.meta_description || stripHtml(post.content))
        .slice(0, 300)
        .trim();

    const readingTime = post.reading_time || 5;
    const publishDate = post.published_at
        ? new Date(post.published_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        })
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(post.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;background:linear-gradient(135deg,#1e40af,#1e3a8a);border-radius:12px 12px 0 0;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:8px;line-height:40px;text-align:center;color:#fff;font-weight:bold;font-size:18px;">JH</div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:12px;">
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">JustHigher</h1>
                    <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Ideas that elevate, inspire, and push you higher</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;background-color:#ffffff;">
              <!-- New post badge -->
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 12px;background-color:#eff6ff;border-radius:20px;font-size:12px;font-weight:600;color:#1e40af;text-transform:uppercase;letter-spacing:0.5px;">
                    ✨ New Post
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <h2 style="margin:20px 0 12px;font-size:24px;font-weight:700;color:#111827;line-height:1.3;letter-spacing:-0.3px;">
                ${escapeHtml(post.title)}
              </h2>

              <!-- Meta info -->
              <p style="margin:0 0 20px;font-size:13px;color:#6b7280;">
                ${publishDate}${publishDate ? ' · ' : ''}${readingTime} min read
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;">

              <!-- Preview text -->
              <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.7;">
                ${escapeHtml(contentPreview)}${contentPreview.length >= 300 ? '...' : ''}
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:8px;background:linear-gradient(135deg,#2563eb,#1d4ed8);">
                    <a href="${postUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Read Full Post →
                    </a>
                  </td>
                </tr>
              </table>

              ${post.tags && post.tags.length > 0 ? `
              <!-- Tags -->
              <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;">
                <p style="margin:0;font-size:12px;color:#9ca3af;">
                  ${post.tags.map(tag => `<span style="display:inline-block;padding:2px 8px;margin:2px 4px 2px 0;background-color:#f3f4f6;border-radius:4px;font-size:12px;color:#6b7280;">${escapeHtml(tag)}</span>`).join('')}
                </p>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#f9fafb;border-radius:0 0 12px 12px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
                You're receiving this because you subscribed to JustHigher Blog.
              </p>
              <p style="margin:0;font-size:13px;">
                <a href="${siteUrl}" style="color:#2563eb;text-decoration:none;">Visit Blog</a>
                &nbsp;·&nbsp;
                <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#d1d5db;">
                © ${new Date().getFullYear()} JustHigher Blog. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Strip HTML tags from content */
function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Escape HTML entities */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
