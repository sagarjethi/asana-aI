'use client'

import { useEffect } from 'react'
import { IoCloseOutline } from 'react-icons/io5'

type Props = {
    open: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
}

export default function InfoSheet({ open, onClose, title, children }: Props) {
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    return (
        <>
            <div
                aria-hidden
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm transition-opacity duration-300 ${
                    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            />
            <aside
                role="dialog"
                aria-modal="true"
                aria-label={title ?? 'Info'}
                className={`fixed z-50 bg-cream-50 shadow-warm transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col
                    inset-x-0 bottom-0 rounded-t-3xl max-h-[85vh]
                    sm:inset-y-0 sm:right-0 sm:bottom-auto sm:left-auto sm:w-[420px] sm:max-w-[90vw] sm:rounded-l-3xl sm:rounded-tr-none sm:max-h-none sm:h-full
                    ${
                        open
                            ? 'translate-y-0 sm:translate-x-0'
                            : 'translate-y-full sm:translate-y-0 sm:translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-ink-900/8">
                    <span className="font-display text-xl text-ink-900">
                        {title ?? 'Info'}
                    </span>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center"
                        aria-label="Close"
                    >
                        <IoCloseOutline className="text-2xl text-ink-800" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-5">
                    <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-ink-900/15 sm:hidden" />
                    {children}
                </div>
            </aside>
        </>
    )
}
