import { NextRequest, NextResponse } from 'next/server';
import { getPostById } from '@/lib/blog';
import { sendNewsletter } from '@/lib/newsletter';

/**
 * POST /api/send-newsletter
 * Sends a published post as a newsletter to all active subscribers.
 * Body: { postId: string }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { postId } = body;

        if (!postId || typeof postId !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Missing or invalid postId' },
                { status: 400 }
            );
        }

        // Check for Resend API key
        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { success: false, error: 'Email service not configured. Add RESEND_API_KEY to your environment variables.' },
                { status: 500 }
            );
        }

        // Fetch the post
        const post = await getPostById(postId);

        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Post not found' },
                { status: 404 }
            );
        }

        if (!post.published_at) {
            return NextResponse.json(
                { success: false, error: 'Post is not published. Only published posts can be sent as newsletters.' },
                { status: 400 }
            );
        }

        // Send the newsletter
        const result = await sendNewsletter(post);

        if (result.total === 0) {
            return NextResponse.json({
                success: true,
                message: 'No active subscribers to send to.',
                ...result,
            });
        }

        return NextResponse.json({
            success: true,
            message: `Newsletter sent to ${result.sent} of ${result.total} subscribers.`,
            ...result,
        });
    } catch (error) {
        console.error('Send newsletter API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send newsletter',
            },
            { status: 500 }
        );
    }
}
