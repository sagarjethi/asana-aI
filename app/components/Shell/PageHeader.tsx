import { ReactNode } from 'react'
import { IoCalendarClearOutline } from 'react-icons/io5'

interface PageHeaderProps {
    title: string
    eyebrow?: string
    description?: string
    right?: ReactNode
    /** If true, render a date pill (today) on the right side */
    showDate?: boolean
}

export function todayLabel() {
    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    const dayNames = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday',
    ]
    const d = new Date()
    return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
}

export default function PageHeader({
    title,
    eyebrow,
    description,
    right,
    showDate,
}: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div className="flex flex-col">
                {eyebrow && (
                    <span className="text-xs uppercase tracking-[0.18em] text-sun-700 font-semibold mb-1">
                        {eyebrow}
                    </span>
                )}
                <h1 className="font-display text-3xl sm:text-4xl text-ink-900 font-medium leading-tight">
                    {title}
                </h1>
                {description && (
                    <p className="mt-2 text-ink-700/80 text-sm sm:text-base max-w-2xl">
                        {description}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-3">
                {right}
                {showDate && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-ink-900/8 text-sm text-ink-700 shadow-soft">
                        <IoCalendarClearOutline className="text-sun-700" />
                        <span className="whitespace-nowrap">{todayLabel()}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
