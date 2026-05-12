'use client'

import { IoPauseOutline, IoPlayOutline, IoInformationOutline } from 'react-icons/io5'
import { TbYoga } from 'react-icons/tb'

type Props = {
    paused: boolean
    onTogglePause: () => void
    onOpenPoses: () => void
    onOpenInfo: () => void
}

export default function ControlDock({
    paused,
    onTogglePause,
    onOpenPoses,
    onOpenInfo,
}: Props) {
    return (
        <div className="fixed bottom-0 inset-x-0 z-30 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 px-3 sm:px-5 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
                <div className="flex items-center justify-between gap-2 rounded-full border border-ink-900/10 bg-cream-50/95 backdrop-blur-md shadow-warm px-3 py-2">
                    <button
                        onClick={onOpenPoses}
                        className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cream-200 text-ink-900 hover:bg-cream-300 active:scale-95 transition"
                        aria-label="Open pose library"
                    >
                        <TbYoga className="text-2xl" />
                    </button>

                    <button
                        onClick={onTogglePause}
                        className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-sun-cta text-ink-900 hover:brightness-95 active:scale-95 shadow-warm transition"
                        aria-label={paused ? 'Resume practice' : 'Pause practice'}
                    >
                        {paused ? (
                            <IoPlayOutline className="text-3xl sm:text-4xl" />
                        ) : (
                            <IoPauseOutline className="text-3xl sm:text-4xl" />
                        )}
                    </button>

                    <button
                        onClick={onOpenInfo}
                        className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cream-200 text-ink-900 hover:bg-cream-300 active:scale-95 transition"
                        aria-label="Open pose info"
                    >
                        <IoInformationOutline className="text-2xl" />
                    </button>
                </div>
            </div>
        </div>
    )
}
