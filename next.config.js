/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'e-cdns-images.dzcdn.net' },
      { protocol: 'https', hostname: 'cdn-images.dzcdn.net' },
    ],
  },
}

module.exports = nextConfig
