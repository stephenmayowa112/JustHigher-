import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Typed routes
  typedRoutes: true,
  
  // Image optimization
  images: {
    domains: [], // Add your Supabase domain here when configured
  },
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Static export configuration for maximum performance
  // Uncomment when ready for production static export
  // output: 'export',
  // trailingSlash: true,
};

export default nextConfig;
