/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['tiktok-live-connector'],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
