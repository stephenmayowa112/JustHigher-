import { NextRequest, NextResponse } from 'next/server';
import { verifyUnsubscribeToken, unsubscribeEmail } from '@/lib/newsletter';

/**
 * GET /api/unsubscribe?email=...&token=...
 * Handles unsubscribe links clicked from newsletter emails.
 */
export async function GET(request: NextRequest) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://justhigher.blog';

    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const token = searchParams.get('token');

        if (!email || !token) {
            return NextResponse.redirect(
                `${siteUrl}/unsubscribe?status=error&message=Missing+email+or+token`
            );
        }

        // Verify the HMAC token
        if (!verifyUnsubscribeToken(email, token)) {
            return NextResponse.redirect(
                `${siteUrl}/unsubscribe?status=error&message=Invalid+unsubscribe+link`
            );
        }

        // Unsubscribe the email
        await unsubscribeEmail(email);

        return NextResponse.redirect(
            `${siteUrl}/unsubscribe?status=success&email=${encodeURIComponent(email)}`
        );
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.redirect(
            `${siteUrl}/unsubscribe?status=error&message=Something+went+wrong`
        );
    }
}
