export default function Quote() {
    return (
        <section className="relative max-w-5xl mx-auto px-6 py-20 sm:py-28">
            <div className="absolute inset-x-10 top-0 bottom-0 -z-10 bg-sun-orb opacity-40 blur-3xl" />
            <figure className="flex flex-col items-center text-center gap-6">
                <span className="font-display text-7xl text-sun-600 leading-none select-none">
                    “
                </span>
                <blockquote className="font-display text-2xl sm:text-3xl text-ink-900 leading-snug max-w-3xl">
                    Yoga is the journey of the self, through the self, to the
                    self. AsanaAI just lights the path with a little more
                    warmth.
                </blockquote>
                <figcaption className="flex flex-col gap-1 text-sm text-ink-800/70">
                    <span className="font-medium text-ink-900">
                        — The AsanaAI team
                    </span>
                    <span>after the second cup of chai</span>
                </figcaption>
            </figure>
        </section>
    )
}
