'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  trackPageView, 
  initPerformanceMonitoring, 
  trackEngagement,
  trackWebVitals 
} from '@/lib/analytics';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view
    trackPageView(pathname);

    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Track user engagement
    const cleanup = trackEngagement();

    return cleanup;
  }, [pathname]);

  return null;
}

// Web Vitals reporting
export function reportWebVitals(metric: any) {
  trackWebVitals(metric);
}