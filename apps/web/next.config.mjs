/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@yuukilist/api', '@yuukilist/shared'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
