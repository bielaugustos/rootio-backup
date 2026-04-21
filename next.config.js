/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr'],
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
}
module.exports = nextConfig
