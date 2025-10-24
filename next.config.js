/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_BASE_CHAIN_ID: '84532',
    NEXT_PUBLIC_BASE_RPC_URL: 'https://sepolia.base.org',
  },
}

module.exports = nextConfig
