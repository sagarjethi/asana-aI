'use client'

import YogaSidebar from '../components/Yoga/Page/Sidebar'
import UserSection from '../components/Yoga/Page/UserSection'

export default function Practice() {
    return (
        <div className="min-h-screen w-full bg-cream-fade text-ink-800 overflow-x-hidden">
            <YogaSidebar />
            <main className="xl:ml-60 pt-20 sm:pt-6 px-3 sm:px-6 pb-12">
                <UserSection />
            </main>
        </div>
    )
}
