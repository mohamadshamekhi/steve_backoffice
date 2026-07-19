import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**'
            },
            {
                protocol: 'http',
                hostname: '**'
            }
        ],
        unoptimized: true
    },
    experimental: {
        authInterrupts: true
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/auth/login',
                permanent: false
            }
        ];
    }
};

export default nextConfig;
