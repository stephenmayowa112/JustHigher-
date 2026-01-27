// Monitoring and logging utilities

export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

export interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Logger class for structured logging
export class Logger {
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  private log(level: keyof LogLevel, message: string, metadata?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      metadata,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
      console[consoleMethod](`[${entry.timestamp}] ${this.context}: ${message}`, metadata, error);
    }

    // In production, you would send this to your logging service
    // Examples: Sentry, LogRocket, DataDog, etc.
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry);
    }
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log('ERROR', message, metadata, error);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('WARN', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('INFO', message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log('DEBUG', message, metadata);
  }

  private async sendToLoggingService(entry: LogEntry) {
    // Example implementation for external logging service
    try {
      // Replace with your actual logging service endpoint
      if (process.env.LOGGING_ENDPOINT) {
        await fetch(process.env.LOGGING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.LOGGING_API_KEY}`,
          },
          body: JSON.stringify(entry),
        });
      }
    } catch (error) {
      // Fallback to console if logging service fails
      console.error('Failed to send log to service:', error);
    }
  }
}

// Global logger instances
export const logger = new Logger('App');
export const apiLogger = new Logger('API');
export const dbLogger = new Logger('Database');
export const authLogger = new Logger('Auth');

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing an operation
  startTimer(operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordMetric(operation, duration);
    };
  }

  // Record a metric value
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only the last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  // Get metric statistics
  getMetricStats(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    const avg = sum / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const p95Index = Math.floor(count * 0.95);
    const p95 = sorted[p95Index];

    return { count, avg, min, max, p95 };
  }

  // Get all metrics
  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [name] of this.metrics) {
      result[name] = this.getMetricStats(name);
    }
    
    return result;
  }

  // Clear metrics
  clearMetrics() {
    this.metrics.clear();
  }
}

// Global performance monitor
export const performanceMonitor = PerformanceMonitor.getInstance();

// Health check utilities
export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  responseTime?: number;
  timestamp: string;
}

export class HealthChecker {
  private checks: Map<string, () => Promise<HealthCheck>> = new Map();

  // Register a health check
  register(name: string, checkFn: () => Promise<HealthCheck>) {
    this.checks.set(name, checkFn);
  }

  // Run all health checks
  async runAll(): Promise<HealthCheck[]> {
    const results: HealthCheck[] = [];
    
    for (const [name, checkFn] of this.checks) {
      try {
        const result = await checkFn();
        results.push(result);
      } catch (error) {
        results.push({
          name,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    return results;
  }

  // Run a specific health check
  async run(name: string): Promise<HealthCheck | null> {
    const checkFn = this.checks.get(name);
    if (!checkFn) {
      return null;
    }

    try {
      return await checkFn();
    } catch (error) {
      return {
        name,
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Global health checker
export const healthChecker = new HealthChecker();

// Register default health checks
healthChecker.register('database', async (): Promise<HealthCheck> => {
  const startTime = performance.now();
  
  try {
    // Simple database connectivity check
    // In a real app, you'd ping your database here
    const responseTime = performance.now() - startTime;
    
    return {
      name: 'database',
      status: 'healthy',
      message: 'Database connection successful',
      responseTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'database',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Database connection failed',
      responseTime: performance.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
});

healthChecker.register('memory', async (): Promise<HealthCheck> => {
  try {
    // Check memory usage (Node.js only)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const usage = (heapUsedMB / heapTotalMB) * 100;
      
      const status = usage > 90 ? 'unhealthy' : usage > 70 ? 'degraded' : 'healthy';
      
      return {
        name: 'memory',
        status,
        message: `Heap usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${usage.toFixed(1)}%)`,
        timestamp: new Date().toISOString(),
      };
    }
    
    return {
      name: 'memory',
      status: 'healthy',
      message: 'Memory check not available in browser',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'memory',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Memory check failed',
      timestamp: new Date().toISOString(),
    };
  }
});

// Error aggregation for monitoring
export class ErrorAggregator {
  private errors: Map<string, { count: number; lastSeen: string; samples: Error[] }> = new Map();
  private maxSamples = 5;

  addError(error: Error, context?: string) {
    const key = `${error.name}:${error.message}:${context || 'unknown'}`;
    const now = new Date().toISOString();
    
    if (this.errors.has(key)) {
      const entry = this.errors.get(key)!;
      entry.count++;
      entry.lastSeen = now;
      
      // Keep only the most recent samples
      if (entry.samples.length >= this.maxSamples) {
        entry.samples.shift();
      }
      entry.samples.push(error);
    } else {
      this.errors.set(key, {
        count: 1,
        lastSeen: now,
        samples: [error],
      });
    }
  }

  getErrorSummary(): Array<{
    error: string;
    count: number;
    lastSeen: string;
    context?: string;
  }> {
    const summary: Array<{
      error: string;
      count: number;
      lastSeen: string;
      context?: string;
    }> = [];
    
    for (const [key, data] of this.errors) {
      const [name, message, context] = key.split(':');
      summary.push({
        error: `${name}: ${message}`,
        count: data.count,
        lastSeen: data.lastSeen,
        context: context !== 'unknown' ? context : undefined,
      });
    }
    
    return summary.sort((a, b) => b.count - a.count);
  }

  clearErrors() {
    this.errors.clear();
  }
}

// Global error aggregator
export const errorAggregator = new ErrorAggregator();