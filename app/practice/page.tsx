'use client'

import { useSearchParams } from 'next/navigation'
import YogaSidebar from '../components/Yoga/Page/Sidebar'
import UserSection from '../components/Yoga/Page/UserSection'
import { poseInfo } from '@/app/api/pose/poseApiData'

export default function Practice() {
    const searchParams = useSearchParams()
    const id = Number(searchParams.get('id') ?? 101)
    const pose = poseInfo.find((p) => p.id === id) ?? poseInfo[0]
    const preloadHref = pose ? `/pose/image/webp/${pose.image}` : null

    return (
        <div className="min-h-screen w-full bg-cream-fade text-ink-800 overflow-x-hidden">
            {preloadHref && (
                <link rel="preload" as="image" href={preloadHref} />
            )}
            <YogaSidebar />
            <main className="xl:ml-60 pt-20 sm:pt-6 px-3 sm:px-6 pb-12">
                <UserSection />
            </main>
        </div>
    )
}
