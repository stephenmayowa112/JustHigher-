import { Resend } from 'resend';
import { createHmac } from 'crypto';
import { supabase } from './supabase';
import { Post, Subscriber } from './types';
import { generateNewsletterEmail } from './email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

const BATCH_SIZE = 50; // Resend supports up to 100 per batch call

/**
 * Generate an HMAC-based unsubscribe token for a subscriber email.
 * This prevents unauthorized unsubscribes.
 */
export function generateUnsubscribeToken(email: string): string {
    const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || 'default-dev-secret';
    return createHmac('sha256', secret).update(email.toLowerCase()).digest('hex');
}

/**
 * Verify an unsubscribe token for a given email.
 */
export function verifyUnsubscribeToken(email: string, token: string): boolean {
    const expected = generateUnsubscribeToken(email);
    return token === expected;
}

/**
 * Build unsubscribe URL for a subscriber.
 */
function buildUnsubscribeUrl(email: string): string {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://justhigher.blog';
    const token = generateUnsubscribeToken(email);
    return `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

/**
 * Get all active subscribers from the database.
 */
async function getActiveSubscribers(): Promise<Subscriber[]> {
    const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('active', true)
        .order('subscribed_at', { ascending: false });

    if (error) {
        console.error('Error fetching active subscribers:', error);
        throw new Error(`Failed to fetch subscribers: ${error.message}`);
    }

    return data || [];
}

/**
 * Send a newsletter email for a published post to all active subscribers.
 * Returns { sent, failed, total } counts.
 */
export async function sendNewsletter(post: Post): Promise<{
    sent: number;
    failed: number;
    total: number;
    errors: string[];
}> {
    const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || 'onboarding@resend.dev';
    const subscribers = await getActiveSubscribers();

    if (subscribers.length === 0) {
        return { sent: 0, failed: 0, total: 0, errors: [] };
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process subscribers in batches
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
        const batch = subscribers.slice(i, i + BATCH_SIZE);

        // Send individual emails (each gets their own unsubscribe link)
        const emailPromises = batch.map(async (subscriber) => {
            const unsubscribeUrl = buildUnsubscribeUrl(subscriber.email);
            const html = generateNewsletterEmail(post, unsubscribeUrl);

            try {
                const { error } = await resend.emails.send({
                    from: `JustHigher Blog <${fromEmail}>`,
                    to: subscriber.email,
                    subject: `New Post: ${post.title}`,
                    html,
                    headers: {
                        'List-Unsubscribe': `<${unsubscribeUrl}>`,
                        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                    },
                });

                if (error) {
                    failed++;
                    errors.push(`${subscriber.email}: ${error.message}`);
                } else {
                    sent++;
                }
            } catch (err) {
                failed++;
                const message = err instanceof Error ? err.message : 'Unknown error';
                errors.push(`${subscriber.email}: ${message}`);
            }
        });

        await Promise.all(emailPromises);
    }

    return {
        sent,
        failed,
        total: subscribers.length,
        errors: errors.slice(0, 10), // Cap error details at 10
    };
}

/**
 * Unsubscribe an email from the newsletter.
 */
export async function unsubscribeEmail(email: string): Promise<void> {
    const { error } = await supabase
        .from('subscribers')
        .update({ active: false })
        .eq('email', email.toLowerCase().trim());

    if (error) {
        console.error('Error unsubscribing:', error);
        throw new Error(`Failed to unsubscribe: ${error.message}`);
    }
}
