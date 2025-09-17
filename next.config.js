/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // During builds, ignore TypeScript errors in generated files
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ignore ESLint errors during builds (since we've configured ignores properly)
    ignoreDuringBuilds: false,
  },
  // Optimize bundle size
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
};

module.exports = nextConfig;