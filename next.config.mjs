/** @type {import('next').NextConfig} */

// Backend target for ngrok-friendly single-origin proxying. When the
// frontend is shared via a single public tunnel, the browser-side
// shim calls /api/* which gets rewritten here to the Express backend.
const BACKEND_TARGET =
    process.env.BACKEND_INTERNAL_URL ?? 'http://127.0.0.1:8080'

const PROXIED_PATHS = [
    'auth',
    'users',
    'poses',
    'leaderboard',
    'diet',
    'achievements',
    'db',
]

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
    async rewrites() {
        return {
            // beforeFiles runs before the App Router's own /api/* routes
            // are considered. We use afterFiles instead so any in-repo
            // API route (e.g. /api/leaderboard proxy) still wins, and
            // only un-handled prefixes fall through to the backend.
            afterFiles: PROXIED_PATHS.map((p) => ({
                source: `/api/${p}/:path*`,
                destination: `${BACKEND_TARGET}/api/${p}/:path*`,
            })),
        }
    },
}

export default nextConfig
