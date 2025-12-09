/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for server-side SQLite support
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
};

export default nextConfig;
