/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  async rewrites() {
    return [
      {
        source: '/api/sleeper/:path*',
        destination: 'https://api.sleeper.app/:path*',
      },
    ];
  },
}

module.exports = nextConfig
