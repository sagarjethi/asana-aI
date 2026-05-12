'use client'

import { IoArrowForwardOutline } from 'react-icons/io5'
import BreathPacer from './BreathPacer'

type PoseSummary = {
    name: string
    originalName: string
    image: string
}

export default function ArriveOverlay({
    pose,
    onStart,
}: {
    pose: PoseSummary | null
    onStart: () => void
}) {
    return (
        <div className="relative w-full">
            <div className="sun-card relative overflow-hidden px-5 sm:px-10 py-10 sm:py-14">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-sun-orb opacity-60"
                />
                <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-7 flex flex-col gap-5">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-sun-700 font-semibold">
                            Arrive
                        </span>
                        <h1 className="font-display text-4xl sm:text-5xl text-ink-900 leading-[1.05]">
                            {pose ? (
                                <>
                                    Take a breath, then{' '}
                                    <span className="bg-sun-cta bg-clip-text text-transparent">
                                        flow into {pose.name}.
                                    </span>
                                </>
                            ) : (
                                'Take a breath. We’ll begin together.'
                            )}
                        </h1>
                        <p className="text-ink-800/75 max-w-xl text-base sm:text-lg leading-relaxed">
                            When you tap start, your camera turns on and the
                            on-device coach begins watching. Voice cues lead
                            the practice — your eyes can stay closed.
                        </p>

                        <ul className="grid grid-cols-3 gap-3 text-xs sm:text-sm text-ink-800/80">
                            <li className="flex flex-col gap-1">
                                <span className="font-display text-ink-900 text-xl">
                                    On-device
                                </span>
                                <span>nothing uploaded</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <span className="font-display text-ink-900 text-xl">
                                    Voice-led
                                </span>
                                <span>eyes off the screen</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <span className="font-display text-ink-900 text-xl">
                                    Pause anytime
                                </span>
                                <span>thumb-reach controls</span>
                            </li>
                        </ul>

                        <button
                            onClick={onStart}
                            className="group inline-flex items-center justify-center gap-2 self-start rounded-full bg-ink-900 px-7 py-4 text-cream-50 text-lg font-medium shadow-warm hover:bg-ember-600 active:scale-[0.98] transition min-h-[56px] min-w-[200px]"
                        >
                            Begin practice
                            <IoArrowForwardOutline className="text-xl transition-transform group-hover:translate-x-1" />
                        </button>
                        <p className="text-xs text-ink-700/60">
                            Tip — prop your phone against a yoga block, 4&ndash;5 feet away.
                        </p>
                    </div>

                    <div className="md:col-span-5 flex flex-col items-center gap-4">
                        <BreathPacer size="lg" />
                        {pose ? (
                            <div className="flex flex-col items-center gap-1 text-center">
                                <span className="text-xs uppercase tracking-widest text-ink-700/60">
                                    Today’s pose
                                </span>
                                <span className="font-display text-xl text-ink-900 capitalize">
                                    {pose.name}
                                </span>
                                <span className="font-display italic text-sm text-ink-700/70 capitalize">
                                    {pose.originalName}
                                </span>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}
