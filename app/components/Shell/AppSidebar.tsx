'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { LuAlignLeft } from 'react-icons/lu'
import { IoClose } from 'react-icons/io5'

export interface SidebarItem {
    key: string
    title: string
    icon: ReactNode
    onClick?: () => void
    href?: string
    active?: boolean
    /** When provided, replaces the default row rendering (e.g. for a Dialog trigger). */
    render?: (compact: boolean) => ReactNode
}

interface AppSidebarProps {
    items: SidebarItem[]
    footerItems?: SidebarItem[]
    /** Title shown in the mobile top bar (e.g. current section) */
    mobileTitle?: string
}

function SidebarBrand() {
    return (
        <Link
            href="/"
            className="flex items-center gap-3 px-2 py-2 rounded-2xl group"
        >
            <span className="flex items-center justify-center h-10 w-10 rounded-2xl bg-sun-cta text-white font-display text-xl shadow-warm">
                A
            </span>
            <span className="font-display text-xl text-ink-900 tracking-tight">
                AsanaAI
            </span>
        </Link>
    )
}

function SidebarRow({ item, compact }: { item: SidebarItem; compact?: boolean }) {
    if (item.render) return <>{item.render(!!compact)}</>

    const baseClass = `relative flex items-center ${
        compact ? 'justify-center px-2' : 'gap-3 px-3'
    } py-2.5 rounded-xl cursor-pointer duration-300 group
        ${
            item.active
                ? 'bg-sun-cta text-white shadow-warm'
                : 'text-ink-800/80 hover:text-ink-900 hover:bg-cream-100'
        }`

    const content = (
        <>
            <span className={`text-2xl ${item.active ? 'text-white' : 'text-ink-800/70 group-hover:text-sun-700'}`}>
                {item.icon}
            </span>
            {!compact && (
                <span className="text-base font-medium capitalize">
                    {item.title}
                </span>
            )}
        </>
    )

    if (item.href) {
        return (
            <Link href={item.href} className={baseClass} aria-label={item.title}>
                {content}
            </Link>
        )
    }
    return (
        <button
            type="button"
            onClick={item.onClick}
            className={baseClass}
            aria-label={item.title}
        >
            {content}
        </button>
    )
}

/**
 * Unified app sidebar:
 *  - sm/md collapses to a slim icon rail (24 px wide nav surface w/ tooltips via title)
 *  - xl expands to a full panel with brand + labels
 *  - on mobile, swaps to a top hamburger bar + slide-in drawer
 */
export default function AppSidebar({
    items,
    footerItems = [],
    mobileTitle,
}: AppSidebarProps) {
    const [open, setOpen] = useState(false)

    const renderList = (compact: boolean) => (
        <div className="flex flex-col gap-1.5">
            {items.map((item) => (
                <SidebarRow key={item.key} item={item} compact={compact} />
            ))}
        </div>
    )

    const renderFooter = (compact: boolean) =>
        footerItems.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-3 border-t border-ink-900/8">
                {footerItems.map((item) => (
                    <SidebarRow key={item.key} item={item} compact={compact} />
                ))}
            </div>
        )

    return (
        <>
            {/* Desktop slim rail (sm-xl) */}
            <aside className="hidden sm:flex xl:hidden fixed top-0 left-0 h-screen w-20 z-40 flex-col items-center justify-between py-5 px-2 bg-cream-50/95 backdrop-blur border-r border-ink-900/8">
                <Link
                    href="/"
                    className="flex items-center justify-center h-11 w-11 rounded-2xl bg-sun-cta text-white font-display text-xl shadow-warm"
                    title="Home"
                >
                    A
                </Link>
                <div className="flex flex-col gap-2 w-full px-1">
                    {items.map((item) => (
                        <SidebarRow key={item.key} item={item} compact />
                    ))}
                </div>
                <div className="flex flex-col gap-2 w-full px-1">
                    {footerItems.map((item) => (
                        <SidebarRow key={item.key} item={item} compact />
                    ))}
                </div>
            </aside>

            {/* Desktop full sidebar (xl+) */}
            <aside className="hidden xl:flex fixed top-0 left-0 h-screen w-60 z-40 flex-col justify-between py-6 px-4 bg-cream-50/95 backdrop-blur border-r border-ink-900/8">
                <div className="flex flex-col gap-6">
                    <SidebarBrand />
                    {renderList(false)}
                </div>
                {renderFooter(false)}
            </aside>

            {/* Mobile top bar */}
            <div className="sm:hidden fixed top-0 left-0 right-0 z-50 px-3 py-3">
                <div className="flex items-center justify-between bg-cream-50/95 backdrop-blur border border-ink-900/8 rounded-2xl shadow-soft px-3 py-2">
                    <button
                        onClick={() => setOpen(true)}
                        className="p-2 rounded-xl text-ink-800 hover:bg-cream-100"
                        aria-label="Open menu"
                    >
                        <LuAlignLeft className="text-2xl" />
                    </button>
                    <span className="font-display text-lg capitalize text-ink-900">
                        {mobileTitle ?? 'AsanaAI'}
                    </span>
                    <span className="flex items-center justify-center h-9 w-9 rounded-xl bg-sun-cta text-white font-display shadow-warm">
                        A
                    </span>
                </div>
            </div>

            {/* Mobile drawer */}
            {open && (
                <>
                    <div
                        className="sm:hidden fixed inset-0 bg-ink-900/30 z-[60]"
                        onClick={() => setOpen(false)}
                    />
                    <aside
                        className="sm:hidden fixed top-0 left-0 h-screen w-72 z-[70] bg-cream-50 border-r border-ink-900/8 flex flex-col justify-between py-5 px-4"
                        onClick={() => setOpen(false)}
                    >
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <SidebarBrand />
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-2 rounded-xl text-ink-800 hover:bg-cream-100"
                                    aria-label="Close menu"
                                >
                                    <IoClose className="text-2xl" />
                                </button>
                            </div>
                            {renderList(false)}
                        </div>
                        {renderFooter(false)}
                    </aside>
                </>
            )}
        </>
    )
}
