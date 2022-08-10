/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  onDemandEntries: {
    pagesBufferLength: 10,
  }
}

module.exports = nextConfig
