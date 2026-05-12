'use client'

import { useEffect, useState } from 'react'

type Phase = 'inhale' | 'hold' | 'exhale'

const PHASES: { phase: Phase; ms: number; label: string }[] = [
    { phase: 'inhale', ms: 4000, label: 'Inhale' },
    { phase: 'hold', ms: 1000, label: 'Hold' },
    { phase: 'exhale', ms: 4000, label: 'Exhale' },
    { phase: 'hold', ms: 1000, label: 'Rest' },
]

export default function BreathPacer({
    size = 'lg',
    showLabel = true,
}: {
    size?: 'sm' | 'lg'
    showLabel?: boolean
}) {
    const [i, setI] = useState(0)
    const [reduced, setReduced] = useState(false)

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        setReduced(mq.matches)
        const onChange = () => setReduced(mq.matches)
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
    }, [])

    useEffect(() => {
        if (reduced) return
        const t = setTimeout(() => setI((n) => (n + 1) % PHASES.length), PHASES[i].ms)
        return () => clearTimeout(t)
    }, [i, reduced])

    const current = PHASES[i]
    const dim = size === 'sm' ? 'w-24 h-24' : 'w-48 h-48 sm:w-56 sm:h-56'
    const scale =
        current.phase === 'inhale' ? 'scale-100' : current.phase === 'exhale' ? 'scale-75' : 'scale-90'
    const duration = `${current.ms}ms`

    return (
        <div className="flex flex-col items-center gap-3" aria-hidden>
            <div className={`relative ${dim}`}>
                <div className="absolute inset-0 rounded-full bg-sun-orb opacity-90" />
                <div
                    className={`absolute inset-2 rounded-full border border-sun-600/30 bg-cream-50/40 backdrop-blur-sm transition-transform ease-[cubic-bezier(0.4,0,0.2,1)] ${scale}`}
                    style={{ transitionDuration: duration }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-ink-900 text-lg sm:text-xl">
                        {showLabel ? current.label : ''}
                    </span>
                </div>
            </div>
        </div>
    )
}
