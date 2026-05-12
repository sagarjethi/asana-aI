import { ReactNode } from 'react'

interface AppShellProps {
    sidebar?: ReactNode
    children: ReactNode
    /** When false (e.g. /practice), don't reserve left padding for sidebar */
    withSidebarOffset?: boolean
}

/**
 * Cream-themed container for every authenticated surface.
 * Provides a consistent gradient background and (optional) left offset
 * to make room for a fixed sidebar.
 */
export default function AppShell({
    sidebar,
    children,
    withSidebarOffset = true,
}: AppShellProps) {
    return (
        <div className="min-h-screen w-full bg-cream-fade text-ink-800">
            {sidebar}
            <main
                className={`relative ${
                    withSidebarOffset
                        ? 'sm:pl-24 xl:pl-64'
                        : ''
                } pt-20 sm:pt-6 pb-12 px-3 sm:px-6`}
            >
                {children}
            </main>
        </div>
    )
}
