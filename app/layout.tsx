import type { Metadata } from 'next'

import { Fraunces, Inter } from 'next/font/google'
import './globals.css'
import { StoreProvider } from '@/lib/store/StoreProvider'
import SmoothScrolling from './components/SmoothScroll'

const fraunces = Fraunces({
    subsets: ['latin'],
    variable: '--font-display',
    display: 'swap',
    weight: ['400', '500', '600', '700'],
})

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'AsanaAI',
    description:
        'AsanaAI: Personalized yoga guidance, real-time feedback, and progress tracking to enhance your practice. Explore now!',
    generator: 'Next.js',
    applicationName: 'AsanaAI',
    icons: 'logo.svg',
    referrer: 'origin-when-cross-origin',
    keywords: [
        'Next.js',
        'React',
        'JavaScript',
        'yoga',
        'github',
        'AsanaAI',
        'Yoga practice',
        'AI yoga guidance',
        'personalized yoga tips',
        'real-time yoga feedback',
        'yoga poses',
        'yoga practice platform',
        'user-friendly yoga app',
        'yoga practice improvement',
        'AI yoga trainer',
        'track yoga progress',
        'celebrate yoga achievements',
        'healthy diet',
        'personalized diet experience',
        'AsanaAI dashboard',
        'project',
    ],
    authors: [
        {
            name: 'AsanaAI',
            url: 'https://asanaai.app',
        },
    ],
    creator: 'AsanaAI',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        title: 'AsanaAI',
        description:
            'AsanaAI: Personalized yoga guidance, real-time feedback, and progress tracking to enhance your practice. Explore now!',
        url: 'https://asanaai.app',
        siteName: 'AsanaAI',
        images: [
            {
                url: '/seo/screens.webp',
                width: 1800,
                height: 1600,
                alt: 'AsanaAI',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AsanaAI',
        description:
            'AsanaAI: Personalized yoga guidance, real-time feedback, and progress tracking to enhance your practice. Explore now!',
        images: ['/seo/screens.webp'],
    },
    robots: 'all',
    publisher: 'AsanaAI',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <StoreProvider>
            <html
                lang="en"
                data-theme="light"
                className={`${fraunces.variable} ${inter.variable}`}
            >
                <body className="font-sans">
                    <SmoothScrolling>{children}</SmoothScrolling>
                </body>
            </html>
        </StoreProvider>
    )
}
