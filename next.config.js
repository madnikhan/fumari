/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Prisma binary files are included in the build
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Copy Prisma binary files to the output directory
      config.externals = config.externals || [];
      // Don't externalize Prisma Client
      config.externals = config.externals.filter(
        (external) => typeof external !== 'string' || !external.includes('@prisma')
      );
    }
    return config;
  },
};

module.exports = nextConfig;

