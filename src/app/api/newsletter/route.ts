import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/blog';
import { subscribeSchema, ValidationError } from '@/lib/validation';
import { checkRateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { trackNewsletterSignup, trackError } from '@/lib/analytics';

// CORS headers for API security
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
    : '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  ...corsHeaders,
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Handle POST request for newsletter subscription
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(request, rateLimitConfigs.newsletter);
    
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

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
        },
        {
          status: 400,
          headers: securityHeaders,
        }
      );
    }

    // Validate input data
    const validationResult = subscribeSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
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

    const { email, source } = validationResult.data;

    // Additional security checks
    if (await isSpamEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email address not allowed',
          code: 'EMAIL_BLOCKED',
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

    // Subscribe to newsletter
    try {
      await subscribeToNewsletter(email, source);
      
      // Track successful signup
      trackNewsletterSignup(email);

      return NextResponse.json(
        {
          success: true,
          message: 'Successfully subscribed to newsletter',
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
      // Handle specific database errors
      if (error instanceof Error) {
        if (error.message.includes('already subscribed')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Email address is already subscribed',
              code: 'ALREADY_SUBSCRIBED',
            },
            {
              status: 409,
              headers: {
                ...securityHeaders,
                ...rateLimitResult.headers,
              },
            }
          );
        }

        // Log error for monitoring
        trackError(error, 'newsletter_subscription');
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to subscribe. Please try again later.',
          code: 'SUBSCRIPTION_FAILED',
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
    console.error('Newsletter API error:', error);
    
    if (error instanceof Error) {
      trackError(error, 'newsletter_api');
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
export async function GET() {
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
        'Allow': 'POST, OPTIONS',
      },
    }
  );
}

// Spam detection helper
async function isSpamEmail(email: string): Promise<boolean> {
  // Basic spam detection rules
  const spamPatterns = [
    /test@test\.com/i,
    /admin@admin\.com/i,
    /noreply@/i,
    /no-reply@/i,
    /\+.*\+.*@/i, // Multiple plus signs
    /\.{2,}/, // Multiple consecutive dots
  ];

  // Check against spam patterns
  for (const pattern of spamPatterns) {
    if (pattern.test(email)) {
      return true;
    }
  }

  // Check domain reputation (basic implementation)
  const domain = email.split('@')[1];
  if (!domain) return true;

  // List of known spam domains (basic list)
  const spamDomains = [
    'example.com',
    'test.com',
    'spam.com',
    'fake.com',
  ];

  return spamDomains.includes(domain.toLowerCase());
}

// Export for testing
export { isSpamEmail };