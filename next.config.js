/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // During builds, ignore TypeScript errors in generated files
    ignoreBuildErrors: false,
  },
  eslint: {
    // Temporarily ignore ESLint errors during builds for deployment
    ignoreDuringBuilds: true,
  },
  // Optimize bundle size
  experimental: {
    optimizePackageImports: ["@heroicons/react"],
  },
  // Fix Windows permissions issue by limiting file system scanning
  webpack: (config, { dev }) => {
    if (!dev) {
      // Limit webpack's file watching and scanning in production builds
      config.watchOptions = {
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/C:/**",
          "**/Documents and Settings/**",
          "**/Users/**/My Documents/**",
          "**/Users/**/Documents/**",
          "**/ProgramData/**",
        ],
      };
    }
    return config;
  },
};

module.exports = nextConfig;
