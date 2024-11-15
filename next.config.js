/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['nodejieba'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to load native modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'child_process': false,
        'fs': false,
        'net': false,
        'tls': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
