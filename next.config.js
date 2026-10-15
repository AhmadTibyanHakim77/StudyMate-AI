/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pdf-parse'],
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
