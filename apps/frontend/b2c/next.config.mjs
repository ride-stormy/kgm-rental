/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@kgm-rental/api-contracts'],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
