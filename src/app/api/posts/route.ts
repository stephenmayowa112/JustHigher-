import { NextRequest, NextResponse } from 'next/server';
import { getPublishedPosts } from '@/lib/blog';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit');

        const posts = await getPublishedPosts(limit ? parseInt(limit, 10) : undefined);

        return NextResponse.json(posts, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                'CDN-Cache-Control': 'public, s-maxage=300',
                'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
            },
        });
    } catch (error) {
        console.error('API error fetching posts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        );
    }
}
