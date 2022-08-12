/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  onDemandEntries: {
    pagesBufferLength: 10,
  },
  compress: true,
  images: {
    formats: ["image/webp"],
  },
}

module.exports = nextConfig
