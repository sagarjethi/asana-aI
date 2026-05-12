import Link from 'next/link'
import { IoArrowForwardOutline } from 'react-icons/io5'

const poses = [
    { id: 'mountain', name: 'Tadasana', en: 'Mountain', level: 'Beginner' },
    { id: 'tree', name: 'Vrikshasana', en: 'Tree', level: 'Beginner' },
    { id: 'warrior1', name: 'Virabhadrasana I', en: 'Warrior I', level: 'Intermediate' },
    { id: 'warrior2', name: 'Virabhadrasana II', en: 'Warrior II', level: 'Intermediate' },
    { id: 'goddess', name: 'Utkata Konasana', en: 'Goddess', level: 'Intermediate' },
    { id: 'downdog', name: 'Adho Mukha', en: 'Downward Dog', level: 'Beginner' },
] as const

export default function PoseGallery() {
    return (
        <section className="relative bg-cream-100/60 border-y border-ink-900/8">
            <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
                    <div className="flex flex-col gap-4 max-w-2xl">
                        <span className="text-xs uppercase tracking-[0.18em] text-ember-600 font-medium">
                            Pose catalogue
                        </span>
                        <h2 className="font-display text-4xl sm:text-5xl text-ink-900 leading-tight">
                            Six asanas to begin. Many more soon.
                        </h2>
                    </div>
                    <Link
                        href="/practice"
                        className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-cream-50 text-sm font-medium hover:bg-ember-600 transition-colors self-start"
                    >
                        Practice now
                        <IoArrowForwardOutline />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {poses.map((p) => (
                        <Link
                            key={p.id}
                            href="/practice"
                            className="group relative rounded-3xl overflow-hidden border border-ink-900/8 bg-cream-50 hover:shadow-warm transition-shadow"
                        >
                            <div className="aspect-[4/5] overflow-hidden">
                                <img
                                    src={`/pose/image/webp/${p.id}.webp`}
                                    alt={`${p.en} pose`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="absolute top-3 left-3 inline-flex items-center rounded-full bg-cream-50/90 backdrop-blur px-2.5 py-1 text-[10px] uppercase tracking-widest text-ink-800/80 border border-ink-900/8">
                                {p.level}
                            </div>
                            <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-ink-900/85 backdrop-blur px-4 py-3 text-cream-50">
                                <p className="font-display text-lg leading-tight">
                                    {p.en}
                                </p>
                                <p className="text-xs text-cream-50/70 italic">
                                    {p.name}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
