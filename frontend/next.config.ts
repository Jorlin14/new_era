import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // Configuración de Turbopack para silenciar warnings
  turbopack: {},
  // DESHABILITADO: React Strict Mode causa doble render en dev
  reactStrictMode: false,
};

export default nextConfig;
