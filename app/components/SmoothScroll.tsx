'use client'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const ReactLenis = dynamic(
    () => import('@studio-freight/react-lenis').then((m) => m.ReactLenis),
    { ssr: false }
)

function SmoothScrolling({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Practice page disables smooth scrolling for camera/pose performance.
    if (pathname?.includes('practice')) {
        return <>{children}</>
    }

    return (
        <ReactLenis
            root
            options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}
        >
            {children}
        </ReactLenis>
    )
}

export default SmoothScrolling
