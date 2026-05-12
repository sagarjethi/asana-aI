import Link from 'next/link'
import { IoArrowForwardOutline } from 'react-icons/io5'

export default function CTA() {
    return (
        <section className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
            <div className="relative overflow-hidden rounded-[40px] bg-sun-cta px-8 sm:px-14 py-16 sm:py-20 text-ink-900 shadow-warm">
                <div
                    aria-hidden
                    className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-cream-50/30 blur-3xl"
                />
                <div
                    aria-hidden
                    className="absolute -bottom-24 -left-16 w-[320px] h-[320px] rounded-full bg-ember-700/30 blur-3xl"
                />

                <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-8 flex flex-col gap-4">
                        <span className="text-xs uppercase tracking-[0.18em] text-ink-900/70">
                            Begin today
                        </span>
                        <h2 className="font-display text-4xl sm:text-5xl leading-tight">
                            Roll out your mat. The sun is already up.
                        </h2>
                        <p className="text-ink-900/85 max-w-xl">
                            One pose, four breaths, and a quiet companion that
                            actually watches. No subscription, no signup wall —
                            just press start.
                        </p>
                    </div>
                    <div className="md:col-span-4 flex md:justify-end">
                        <Link
                            href="/practice"
                            className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-7 py-4 text-cream-50 font-medium hover:bg-ember-700 transition-colors"
                        >
                            Start your session
                            <IoArrowForwardOutline className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
