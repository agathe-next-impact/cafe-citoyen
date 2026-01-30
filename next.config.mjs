/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Suppression des console.log en production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimisation des imports pour réduire le bundle JS
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  // Minification avancée du JavaScript
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    // Formats modernes pour réduire la taille des images
    formats: ['image/avif', 'image/webp'],
    // Limiter les tailles générées
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wordpress-starter.fr',
      },
      {
        protocol: 'https',
        hostname: '**.wordpress-starter.fr',
      },
      {
        protocol: 'https',
        hostname: '**.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
      },
    ],
  },
 
}

export default nextConfig