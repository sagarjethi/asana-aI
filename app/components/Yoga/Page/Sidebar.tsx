'use client'

import { poseInfo } from '@/app/api/pose/poseApiData'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'
import { useState } from 'react'
import { IoAccessibility, IoClose } from 'react-icons/io5'
import { useSearchParams } from 'next/navigation'

import '@/app/components/Yoga/yoga.css'

interface sidebarShowCase {
    id: number
    title: string
    image: string
}

function PoseList({
    pose,
    activeId,
    onSelect,
}: {
    pose: sidebarShowCase[]
    activeId: number | null
    onSelect?: () => void
}) {
    return (
        <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-3 px-2 py-1 mb-1">
                <span className="flex items-center justify-center h-9 w-9 rounded-2xl bg-sun-cta text-white font-display shadow-warm">
                    A
                </span>
                <span className="font-display text-lg text-ink-900">
                    AsanaAI
                </span>
            </Link>
            <div className="px-2 py-1">
                <span className="text-[10px] uppercase tracking-[0.18em] text-sun-700 font-semibold">
                    Pose library
                </span>
            </div>
            {pose.map((p) => {
                const active = activeId === p.id
                return (
                    <Link
                        key={p.id}
                        href={`/practice?id=${p.id}`}
                        onClick={onSelect}
                    >
                        <div
                            className={`group rounded-2xl overflow-hidden border duration-300 cursor-pointer bg-cream-50 ${
                                active
                                    ? 'border-sun-600 ring-2 ring-sun-600/30 shadow-warm'
                                    : 'border-ink-900/8 hover:border-sun-600/40'
                            }`}
                        >
                            <div className="w-full bg-cream-100 p-2 flex items-center justify-center">
                                <img
                                    src={`/pose/image/webp/${p.image}`}
                                    alt={p.title}
                                    className="h-20 w-full object-contain mix-blend-multiply group-hover:scale-105 duration-500"
                                />
                            </div>
                            <div className="px-3 py-2">
                                <span
                                    className={`font-display text-sm capitalize ${
                                        active
                                            ? 'text-sun-700'
                                            : 'text-ink-900'
                                    }`}
                                >
                                    {p.title}
                                </span>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

export default function YogaSidebar() {
    const [open, setOpen] = useState<boolean>(false)
    const searchParams = useSearchParams()
    const activeId = Number(searchParams.get('id') ?? 101)

    const pose: sidebarShowCase[] = poseInfo.map((pose) => ({
        id: pose.id,
        title: pose.name,
        image: pose.image,
    }))

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden xl:flex fixed top-0 left-0 h-screen w-60 z-40 flex-col bg-cream-50/95 backdrop-blur border-r border-ink-900/8">
                <ScrollArea
                    data-lenis-prevent
                    className="h-screen w-full p-3"
                >
                    <PoseList pose={pose} activeId={activeId} />
                </ScrollArea>
            </aside>

            {/* Mobile top bar */}
            <div className="xl:hidden fixed top-0 left-0 right-0 z-50 px-3 py-3">
                <div className="flex items-center justify-between bg-cream-50/95 backdrop-blur border border-ink-900/8 rounded-2xl shadow-soft px-3 py-2">
                    <button
                        onClick={() => setOpen(true)}
                        className="p-2 rounded-xl text-ink-800 hover:bg-cream-100"
                        aria-label="Open pose library"
                    >
                        <IoAccessibility className="text-2xl text-sun-700" />
                    </button>
                    <span className="font-display text-lg text-ink-900">
                        Practice
                    </span>
                    <Link
                        href="/"
                        className="flex items-center justify-center h-9 w-9 rounded-xl bg-sun-cta text-white font-display shadow-warm"
                    >
                        A
                    </Link>
                </div>
            </div>

            {/* Mobile drawer */}
            {open && (
                <>
                    <div
                        className="xl:hidden fixed inset-0 bg-ink-900/30 z-[60]"
                        onClick={() => setOpen(false)}
                    />
                    <aside className="xl:hidden fixed top-0 left-0 h-screen w-72 z-[70] bg-cream-50 border-r border-ink-900/8">
                        <div className="flex items-center justify-end p-3">
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 rounded-xl text-ink-800 hover:bg-cream-100"
                                aria-label="Close pose library"
                            >
                                <IoClose className="text-2xl" />
                            </button>
                        </div>
                        <ScrollArea
                            data-lenis-prevent
                            className="h-[calc(100vh-3.5rem)] w-full p-3"
                        >
                            <PoseList
                                pose={pose}
                                activeId={activeId}
                                onSelect={() => setOpen(false)}
                            />
                        </ScrollArea>
                    </aside>
                </>
            )}
        </>
    )
}
