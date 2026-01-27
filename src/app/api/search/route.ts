import { NextRequest, NextResponse } from 'next/server';
import { searchPosts } from '@/lib/blog';
import { searchSchema } from '@/lib/validation';
import { checkRateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { trackSearch, trackError } from '@/lib/analytics';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
    : '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
  ...corsHeaders,
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Handle GET request for search
export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(request, rateLimitConfigs.search);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error,
          code: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: {
            ...securityHeaders,
            ...rateLimitResult.headers,
          },
        }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limitParam = searchParams.get('limit');

    // Validate query parameters
    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required',
          code: 'MISSING_QUERY',
        },
        {
          status: 400,
          headers: {
            ...securityHeaders,
            ...rateLimitResult.headers,
          },
        }
      );
    }

    // Parse and validate search parameters
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    
    const validationResult = searchSchema.safeParse({ q: query, limit });
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid search parameters',
          code: 'VALIDATION_ERROR',
          details: errors,
        },
        {
          status: 400,
          headers: {
            ...securityHeaders,
            ...rateLimitResult.headers,
          },
        }
      );
    }

    const { q: validatedQuery, limit: validatedLimit } = validationResult.data;

    // Perform search
    try {
      const results = await searchPosts(validatedQuery, validatedLimit);
      
      // Track search
      trackSearch(validatedQuery, results.length);

      // Return results
      return NextResponse.json(
        {
          success: true,
          data: {
            query: validatedQuery,
            results,
            total: results.length,
            limit: validatedLimit,
          },
        },
        {
          status: 200,
          headers: {
            ...securityHeaders,
            ...rateLimitResult.headers,
          },
        }
      );
    } catch (error) {
      // Handle search errors
      console.error('Search error:', error);
      
      if (error instanceof Error) {
        trackError(error, 'search_api');
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Search failed. Please try again later.',
          code: 'SEARCH_FAILED',
        },
        {
          status: 500,
          headers: {
            ...securityHeaders,
            ...rateLimitResult.headers,
          },
        }
      );
    }
  } catch (error) {
    // Catch-all error handler
    console.error('Search API error:', error);
    
    if (error instanceof Error) {
      trackError(error, 'search_api');
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      {
        status: 500,
        headers: securityHeaders,
      }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
    },
    {
      status: 405,
      headers: {
        ...securityHeaders,
        'Allow': 'GET, OPTIONS',
      },
    }
  );
}