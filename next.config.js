/** @type {import('next').NextConfig} */
const { withAxiom } = require('next-axiom');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = withAxiom(nextConfig)
