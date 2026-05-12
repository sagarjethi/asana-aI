import Link from 'next/link'
import { IoArrowForwardOutline } from 'react-icons/io5'

export default function Header() {
    return (
        <section className="relative overflow-hidden">
            {/* Sun orb */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] bg-sun-orb animate-sun-pulse"
            />

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 flex flex-col gap-7">
                    <span className="inline-flex items-center gap-2 self-start rounded-full border border-ink-900/10 bg-cream-50/70 backdrop-blur px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink-800/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-sun-600 animate-pulse" />
                        Now in early practice
                    </span>

                    <h1 className="font-display font-semibold text-ink-900 text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
                        Move with the{' '}
                        <span className="relative inline-block">
                            <span className="bg-sun-cta bg-clip-text text-transparent">
                                morning sun.
                            </span>
                        </span>
                    </h1>

                    <p className="text-lg text-ink-800/80 max-w-xl leading-relaxed">
                        AsanaAI is a quiet yoga companion that watches your
                        form through your camera and gently corrects it — in
                        real time, on your device, never uploaded.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/practice"
                            className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-cream-50 font-medium shadow-warm hover:bg-ember-600 transition-colors"
                        >
                            Start practicing
                            <IoArrowForwardOutline className="transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 bg-cream-50/70 backdrop-blur px-6 py-3 text-ink-900 font-medium hover:bg-cream-100 transition-colors"
                        >
                            Sign in
                        </Link>
                    </div>

                    <div className="flex items-center gap-6 pt-4 text-sm text-ink-700/70">
                        <div className="flex flex-col">
                            <span className="font-display text-2xl text-ink-900">
                                6+
                            </span>
                            <span>guided asanas</span>
                        </div>
                        <div className="w-px h-10 bg-ink-900/10" />
                        <div className="flex flex-col">
                            <span className="font-display text-2xl text-ink-900">
                                0
                            </span>
                            <span>frames uploaded</span>
                        </div>
                        <div className="w-px h-10 bg-ink-900/10" />
                        <div className="flex flex-col">
                            <span className="font-display text-2xl text-ink-900">
                                ~30fps
                            </span>
                            <span>in-browser feedback</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 relative">
                    <div className="relative rounded-[36px] bg-cream-50 border border-ink-900/8 shadow-warm overflow-hidden animate-float-y">
                        <img
                            src="/pose/image/webp/tree.webp"
                            alt="Tree pose"
                            className="w-full h-[420px] sm:h-[480px] object-cover"
                        />
                        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-cream-50/95 backdrop-blur px-4 py-3 flex items-center justify-between border border-ink-900/8">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-ink-700/60">
                                    Live feedback
                                </p>
                                <p className="font-display text-lg text-ink-900">
                                    Vrikshasana — Tree pose
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-600 px-3 py-1 text-xs text-cream-50">
                                <span className="w-1.5 h-1.5 rounded-full bg-cream-50 animate-pulse" />
                                94% aligned
                            </span>
                        </div>
                    </div>
                    <div className="absolute -bottom-4 -left-4 rounded-2xl bg-ink-900 text-cream-50 px-4 py-3 shadow-soft hidden sm:block">
                        <p className="text-xs uppercase tracking-widest text-cream-50/60">
                            Hip
                        </p>
                        <p className="font-display text-lg">+3° rotate left</p>
                    </div>
                    <div className="absolute -top-4 -right-4 rounded-2xl bg-sun-cta text-ink-900 px-4 py-3 shadow-soft hidden sm:block">
                        <p className="text-xs uppercase tracking-widest">
                            Breath
                        </p>
                        <p className="font-display text-lg">Inhale · 4s</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
