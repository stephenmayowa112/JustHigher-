import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long')
  .refine(
    (email) => {
      // Additional email validation rules
      const domain = email.split('@')[1];
      if (!domain) return false;
      
      // Check for common disposable email domains (basic list)
      const disposableDomains = [
        '10minutemail.com',
        'tempmail.org',
        'guerrillamail.com',
        'mailinator.com',
        'throwaway.email'
      ];
      
      return !disposableDomains.includes(domain.toLowerCase());
    },
    {
      message: 'Disposable email addresses are not allowed'
    }
  );

// Newsletter subscription schema
export const subscribeSchema = z.object({
  email: emailSchema,
  source: z.string().optional().default('website'),
});

// Search query schema
export const searchSchema = z.object({
  q: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query is too long')
    .refine(
      (query) => {
        // Prevent potential XSS in search queries
        const dangerousChars = /<script|javascript:|data:|vbscript:/i;
        return !dangerousChars.test(query);
      },
      {
        message: 'Invalid characters in search query'
      }
    ),
  limit: z.number().min(1).max(50).optional().default(10),
});

// Blog post creation schema (admin only)
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long')
    .refine(
      (title) => title.trim().length > 0,
      'Title cannot be empty or only whitespace'
    ),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(50000, 'Content is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug is too long')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),
  tags: z
    .array(z.string().min(1).max(50))
    .max(10, 'Too many tags')
    .optional()
    .default([]),
  meta_description: z
    .string()
    .max(160, 'Meta description is too long')
    .optional(),
  published_at: z
    .string()
    .datetime()
    .optional()
    .nullable(),
});

// Blog post update schema (admin only)
export const updatePostSchema = createPostSchema.partial();

// Contact form schema (if needed)
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .refine(
      (name) => {
        // Basic name validation - letters, spaces, hyphens, apostrophes
        const nameRegex = /^[a-zA-Z\s\-']+$/;
        return nameRegex.test(name);
      },
      'Name contains invalid characters'
    ),
  email: emailSchema,
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject is too long'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long'),
});

// Validation helper functions
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  try {
    emailSchema.parse(email);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.issues[0].message };
    }
    return { isValid: false, error: 'Invalid email format' };
  }
}

export function validateSearchQuery(query: string): { isValid: boolean; error?: string } {
  try {
    searchSchema.parse({ q: query });
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.issues[0].message };
    }
    return { isValid: false, error: 'Invalid search query' };
  }
}

export function sanitizeInput(input: string): string {
  // Basic HTML sanitization
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeSearchQuery(query: string): string {
  // Sanitize search query while preserving search functionality
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .substring(0, 100); // Limit length
}

// Rate limiting validation
export function validateRateLimit(
  identifier: string,
  windowMs: number,
  maxRequests: number,
  requestLog: Map<string, number[]>
): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Get or create request log for this identifier
  const requests = requestLog.get(identifier) || [];
  
  // Filter out requests outside the current window
  const recentRequests = requests.filter(time => time > windowStart);
  
  // Check if limit exceeded
  if (recentRequests.length >= maxRequests) {
    const oldestRequest = Math.min(...recentRequests);
    const resetTime = oldestRequest + windowMs;
    return { allowed: false, resetTime };
  }
  
  // Add current request and update log
  recentRequests.push(now);
  requestLog.set(identifier, recentRequests);
  
  return { allowed: true };
}

// Input sanitization for different contexts
export const sanitizers = {
  // For display in HTML
  html: (input: string): string => {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },
  
  // For use in URLs
  url: (input: string): string => {
    return encodeURIComponent(input);
  },
  
  // For database queries (basic)
  sql: (input: string): string => {
    return input.replace(/'/g, "''");
  },
  
  // For search queries
  search: sanitizeSearchQuery,
};

// Validation error types
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public resetTime?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}