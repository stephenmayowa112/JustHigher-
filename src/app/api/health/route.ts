import { NextRequest, NextResponse } from 'next/server';
import { healthChecker, performanceMonitor, errorAggregator } from '@/lib/monitoring';

// Health check endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    
    // Run all health checks
    const healthChecks = await healthChecker.runAll();
    
    // Determine overall status
    const hasUnhealthy = healthChecks.some(check => check.status === 'unhealthy');
    const hasDegraded = healthChecks.some(check => check.status === 'degraded');
    
    const overallStatus = hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';
    
    // Basic response
    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime ? Math.floor(process.uptime()) : null,
    };

    // Add detailed information if requested
    if (detailed) {
      const detailedResponse = {
        ...response,
        checks: healthChecks,
        performance: performanceMonitor.getAllMetrics(),
        errors: errorAggregator.getErrorSummary().slice(0, 10), // Top 10 errors
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          memory: process.memoryUsage ? process.memoryUsage() : null,
        },
      };

      return NextResponse.json(detailedResponse, {
        status: overallStatus === 'healthy' ? 200 : 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    return NextResponse.json(response, {
      status: overallStatus === 'healthy' ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}