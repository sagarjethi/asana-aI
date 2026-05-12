import {
    IoLockClosedOutline,
    IoLeafOutline,
    IoFlashOutline,
    IoHeadsetOutline,
} from 'react-icons/io5'

const features = [
    {
        icon: <IoLockClosedOutline className="text-xl" />,
        title: 'Private by design',
        body: 'Your webcam frames are analyzed in-browser. Nothing is uploaded, recorded, or shared.',
        tone: 'sage',
    },
    {
        icon: <IoFlashOutline className="text-xl" />,
        title: 'Real-time corrections',
        body: 'Per-joint feedback at roughly 30 fps — gentle nudges, not a lecture after the fact.',
        tone: 'sun',
    },
    {
        icon: <IoHeadsetOutline className="text-xl" />,
        title: 'Calm narrator',
        body: 'Voice guidance through every pose so you can keep your eyes off the screen.',
        tone: 'ember',
    },
    {
        icon: <IoLeafOutline className="text-xl" />,
        title: 'Built around breath',
        body: 'Pacing cues that match the natural rhythm of inhale and exhale, not a stopwatch.',
        tone: 'sage',
    },
]

const tones: Record<string, { wrap: string; icon: string }> = {
    sage: { wrap: 'bg-sage-300/40 border-sage-600/20', icon: 'bg-sage-600 text-cream-50' },
    sun: { wrap: 'bg-sun-300/40 border-sun-600/25', icon: 'bg-sun-600 text-cream-50' },
    ember: { wrap: 'bg-ember-500/15 border-ember-600/25', icon: 'bg-ember-600 text-cream-50' },
}

export default function Features() {
    return (
        <section className="max-w-6xl mx-auto px-6 py-20 sm:py-28">
            <div className="flex flex-col gap-4 max-w-2xl mb-12">
                <span className="text-xs uppercase tracking-[0.18em] text-ember-600 font-medium">
                    Why AsanaAI
                </span>
                <h2 className="font-display text-4xl sm:text-5xl text-ink-900 leading-tight">
                    A quieter way to practice.
                </h2>
                <p className="text-ink-800/75 text-lg leading-relaxed">
                    The room. Your mat. A camera that watches for the things
                    your teacher would point out, without ever leaving the
                    device in front of you.
                </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
                {features.map((f) => {
                    const t = tones[f.tone]
                    return (
                        <div
                            key={f.title}
                            className={`rounded-3xl border ${t.wrap} p-7 flex gap-5 items-start`}
                        >
                            <div
                                className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${t.icon}`}
                            >
                                {f.icon}
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="font-display text-xl text-ink-900">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-ink-800/80 leading-relaxed">
                                    {f.body}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
