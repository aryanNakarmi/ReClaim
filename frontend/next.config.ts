import type { NextConfig } from 'next'

const backendURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";
const IsDEV = backendURL.startsWith("http://localhost") || backendURL.startsWith("http://192") || backendURL.startsWith("http://0.0.0.0");

const config: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: IsDEV,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5050',
        pathname: '/profile_pictures/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.7',
        port: '5050',
        pathname: '/profile_pictures/**',
      },
      {
        protocol: 'http',
        hostname: '0.0.0.0',
        port: '5050',
        pathname: '/profile_pictures/**',
      },
      {
        protocol: 'http',
        hostname: '**',  
        pathname: '/**',
      },
    ]
  },
}

export default config;