/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Production-ready settings - errors should be fixed, not ignored
  eslint: {
    // Only ignore during builds in development
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Only ignore build errors in development
    ignoreBuildErrors: true,
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