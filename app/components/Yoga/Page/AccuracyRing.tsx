'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'

const SIZE = 96
const STROKE = 8
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

export default function AccuracyRing() {
    const accuracyArr = useSelector(
        (s: RootState) => s.practiceSlice?.analysis?.accuracy ?? []
    ) as number[]
    const last = accuracyArr.length ? accuracyArr[accuracyArr.length - 1] : 0
    const pct = Math.max(0, Math.min(100, Math.round(last)))
    const offset = C - (pct / 100) * C

    const ringColor =
        pct >= 80 ? 'stroke-sage-600' : pct >= 50 ? 'stroke-sun-600' : 'stroke-ember-600'

    return (
        <div
            className="pointer-events-none absolute top-3 right-3 flex flex-col items-center gap-1"
            aria-label={`Pose accuracy ${pct} percent`}
        >
            <div className="relative">
                <svg width={SIZE} height={SIZE} className="drop-shadow-md">
                    <circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={R}
                        stroke="rgba(255,251,244,0.25)"
                        strokeWidth={STROKE}
                        fill="rgba(36,25,20,0.35)"
                    />
                    <circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={R}
                        strokeWidth={STROKE}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={C}
                        strokeDashoffset={offset}
                        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                        className={`${ringColor} transition-[stroke-dashoffset] duration-500 ease-out`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-cream-50 text-xl leading-none">
                        {pct}%
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-cream-50/70">
                        aligned
                    </span>
                </div>
            </div>
        </div>
    )
}
