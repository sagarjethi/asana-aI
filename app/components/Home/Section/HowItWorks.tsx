import { IoCameraOutline, IoBodyOutline, IoSparklesOutline } from 'react-icons/io5'

const steps = [
    {
        n: '01',
        icon: <IoCameraOutline className="text-2xl" />,
        title: 'Open your camera',
        body: 'AsanaAI loads a lightweight pose-estimation model directly in your browser — nothing is sent to a server.',
    },
    {
        n: '02',
        icon: <IoBodyOutline className="text-2xl" />,
        title: 'Pick a pose',
        body: 'Choose from a curated catalogue of asanas. Each comes with audio cues and a reference silhouette.',
    },
    {
        n: '03',
        icon: <IoSparklesOutline className="text-2xl" />,
        title: 'Receive gentle nudges',
        body: 'See per-joint feedback in real time. Small, specific corrections instead of generic “well done.”',
    },
]

export default function HowItWorks() {
    return (
        <section className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28">
            <div className="flex flex-col gap-4 max-w-2xl mb-12">
                <span className="text-xs uppercase tracking-[0.18em] text-ember-600 font-medium">
                    How it works
                </span>
                <h2 className="font-display text-4xl sm:text-5xl text-ink-900 leading-tight">
                    Three breaths, and you&apos;re practicing.
                </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {steps.map((s) => (
                    <div
                        key={s.n}
                        className="sun-card p-6 flex flex-col gap-4 hover:shadow-warm transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-11 h-11 rounded-2xl bg-cream-200 text-ember-600 flex items-center justify-center">
                                {s.icon}
                            </div>
                            <span className="font-display text-2xl text-ink-900/30">
                                {s.n}
                            </span>
                        </div>
                        <h3 className="font-display text-xl text-ink-900">
                            {s.title}
                        </h3>
                        <p className="text-sm text-ink-800/75 leading-relaxed">
                            {s.body}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    )
}
