/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    compress: true,
    productionBrowserSourceMaps: false,
    poweredByHeader: false,
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'flagicons.lipis.dev',
            },
        ],
    },
    experimental: {
        missingSuspenseWithCSRBailout: false,
        optimizePackageImports: [
            'react-icons',
            'lucide-react',
            'date-fns',
            'framer-motion',
        ],
    },
}

export default nextConfig
