import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, toggleSubscriberStatus, deleteSubscriber } from '@/lib/blog';

/**
 * POST /api/subscribers - Add a subscriber manually (admin)
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const subscriber = await addSubscriber(email, 'admin');
        return NextResponse.json({ success: true, subscriber });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to add subscriber';
        const status = message.includes('already subscribed') ? 409 : 500;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}

/**
 * PATCH /api/subscribers - Toggle subscriber status (admin)
 * Body: { id: string, active: boolean }
 */
export async function PATCH(request: NextRequest) {
    try {
        const { id, active } = await request.json();

        if (!id || typeof active !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'Missing id or active status' },
                { status: 400 }
            );
        }

        await toggleSubscriberStatus(id, active);
        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update subscriber';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

/**
 * DELETE /api/subscribers - Delete a subscriber (admin)
 * Body: { id: string }
 */
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Subscriber ID is required' },
                { status: 400 }
            );
        }

        await deleteSubscriber(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete subscriber';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
