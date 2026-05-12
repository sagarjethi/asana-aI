import { ReactNode } from 'react'

interface StatCardProps {
    label: string
    value: ReactNode
    icon?: ReactNode
    accent?: 'sun' | 'sage' | 'ember' | 'ink'
    helper?: string
}

const accentMap = {
    sun: 'bg-sun-100 text-sun-700',
    sage: 'bg-sage-300/30 text-sage-700',
    ember: 'bg-ember-500/10 text-ember-600',
    ink: 'bg-ink-900/8 text-ink-800',
}

export default function StatCard({
    label,
    value,
    icon,
    accent = 'sun',
    helper,
}: StatCardProps) {
    return (
        <div className="sun-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-ink-700/70 font-medium">
                    {label}
                </span>
                {icon && (
                    <span
                        className={`inline-flex items-center justify-center h-9 w-9 rounded-full ${
                            accentMap[accent] ?? accentMap.sun
                        }`}
                    >
                        {icon}
                    </span>
                )}
            </div>
            <div className="font-display text-3xl text-ink-900">{value}</div>
            {helper && (
                <span className="text-xs text-ink-700/60">{helper}</span>
            )}
        </div>
    )
}
