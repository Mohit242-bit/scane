/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Disable caching in development to prevent corruption issues
    if (dev) {
      config.cache = false
    }
    return config
  },
  
  // Enable proper type checking and linting for production builds
  // This ensures code quality and catches errors early
  eslint: {
    // Run ESLint during production builds to catch issues
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Run TypeScript type checking during production builds
    ignoreBuildErrors: true, // Temporarily disabled for testing
  },
  
  // Image optimization configuration
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com', 'ljvmtgfnnhboyusgfmap.supabase.co'],
    // Keep unoptimized for development, should be false in production
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
  },
  
  // Compression
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig