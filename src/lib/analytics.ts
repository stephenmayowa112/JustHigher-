// Performance monitoring and analytics utilities

declare global {
  interface Window {
    va?: any; // Vercel Analytics
    gtag?: any; // Google Analytics
  }
}

/**
 * Track page views
 */
export function trackPageView(url: string, title?: string) {
  // Vercel Analytics
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', 'pageview', { url, title });
  }

  // Google Analytics (if configured)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_title: title,
      page_location: url,
    });
  }
}

/**
 * Track custom events
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  // Vercel Analytics
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', eventName, properties);
  }

  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
}

/**
 * Track newsletter signups
 */
export function trackNewsletterSignup(email?: string) {
  trackEvent('newsletter_signup', {
    // Only track domain for privacy
    domain: email ? email.split('@')[1] : undefined,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track search queries
 */
export function trackSearch(query: string, resultsCount: number) {
  trackEvent('search', {
    query_length: query.length,
    results_count: resultsCount,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track post engagement
 */
export function trackPostView(postSlug: string, postTitle: string) {
  trackEvent('post_view', {
    post_slug: postSlug,
    post_title: postTitle,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track reading time
 */
export function trackReadingTime(postSlug: string, timeSpent: number) {
  trackEvent('reading_time', {
    post_slug: postSlug,
    time_spent_seconds: timeSpent,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Core Web Vitals tracking
 */
export function trackWebVitals(metric: any) {
  // Track Core Web Vitals
  trackEvent('web_vital', {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    label: metric.label,
  });
}

/**
 * Performance observer for monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Monitor Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            trackEvent('performance_metric', {
              metric: 'LCP',
              value: entry.startTime,
              timestamp: new Date().toISOString(),
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }

  // Monitor First Input Delay (FID)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            trackEvent('performance_metric', {
              metric: 'FID',
              value: (entry as any).processingStart - entry.startTime,
              timestamp: new Date().toISOString(),
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID monitoring not supported:', error);
    }
  }

  // Monitor Cumulative Layout Shift (CLS)
  if ('PerformanceObserver' in window) {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });

      // Report CLS when the page is about to be unloaded
      window.addEventListener('beforeunload', () => {
        trackEvent('performance_metric', {
          metric: 'CLS',
          value: clsValue,
          timestamp: new Date().toISOString(),
        });
      });
    } catch (error) {
      console.warn('CLS monitoring not supported:', error);
    }
  }
}

/**
 * Error tracking
 */
export function trackError(error: Error, context?: string) {
  trackEvent('error', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * User engagement tracking
 */
export function trackEngagement() {
  if (typeof window === 'undefined') return;

  let startTime = Date.now();
  let isActive = true;

  // Track time on page
  const trackTimeOnPage = () => {
    if (isActive) {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackEvent('time_on_page', {
        seconds: timeSpent,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Track when user becomes inactive
  const handleVisibilityChange = () => {
    if (document.hidden) {
      isActive = false;
      trackTimeOnPage();
    } else {
      isActive = true;
      startTime = Date.now();
    }
  };

  // Track when user leaves the page
  const handleBeforeUnload = () => {
    trackTimeOnPage();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}