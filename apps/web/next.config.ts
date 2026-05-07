import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  // These packages use native Node.js APIs (Buffer, crypto, etc.) and must
  // be treated as external so Next.js doesn't try to bundle them for the edge.
  serverExternalPackages: [
    'bip39',
    'ed25519-hd-key',
    '@solana/web3.js',
    '@mysten/sui.js',
    '@solana/spl-token',
    'ccxt',
    'protobufjs'
  ],

  // Silence the "multiple lockfiles" Turbopack warning by explicitly setting root
  turbopack: {
    root: __dirname,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile pictures (OAuth)
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
