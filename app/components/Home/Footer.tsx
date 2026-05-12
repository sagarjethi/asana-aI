import Link from 'next/link'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

export default async function Footer() {
    const social = [
        { icon: <FaGithub />, href: 'https://github.com/' },
        { icon: <FaLinkedinIn />, href: 'https://www.linkedin.com/' },
        { icon: <FaXTwitter />, href: 'https://twitter.com/' },
    ]

    const linkCols = [
        {
            title: 'Practice',
            links: [
                { name: 'All poses', href: '/practice' },
                { name: 'Leaderboard', href: '/leaderboard' },
                { name: 'Diet companion', href: '/diet' },
            ],
        },
        {
            title: 'Account',
            links: [
                { name: 'Sign in', href: '/login' },
                { name: 'Dashboard', href: '/dashboard' },
            ],
        },
    ]

    return (
        <footer className="bg-ink-900 text-cream-50">
            <div className="max-w-6xl mx-auto px-6 pt-16 pb-10 grid md:grid-cols-12 gap-10">
                <div className="md:col-span-5 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-sun-cta flex items-center justify-center text-ink-900 font-display font-bold">
                            A
                        </div>
                        <span className="font-display text-2xl">AsanaAI</span>
                    </div>
                    <p className="text-cream-200/70 max-w-sm leading-relaxed text-sm">
                        A warm, on-device yoga partner. Made for slow mornings
                        and steady breath.
                    </p>
                    <div className="flex gap-3 pt-2">
                        {social.map((s, i) => (
                            <Link
                                key={i}
                                href={s.href}
                                target="_blank"
                                className="w-10 h-10 rounded-full border border-cream-50/15 hover:bg-sun-600 hover:border-sun-600 hover:text-ink-900 transition-colors flex items-center justify-center text-lg"
                            >
                                {s.icon}
                            </Link>
                        ))}
                    </div>
                </div>

                {linkCols.map((col) => (
                    <div
                        key={col.title}
                        className="md:col-span-3 flex flex-col gap-3"
                    >
                        <p className="font-display text-sun-300 text-sm uppercase tracking-widest">
                            {col.title}
                        </p>
                        {col.links.map((l) => (
                            <Link
                                key={l.name}
                                href={l.href}
                                className="text-cream-200/80 hover:text-sun-400 transition-colors text-sm"
                            >
                                {l.name}
                            </Link>
                        ))}
                    </div>
                ))}
            </div>

            <div className="border-t border-cream-50/10">
                <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-cream-200/60">
                    <p>© {new Date().getFullYear()} AsanaAI</p>
                    <p>Practice gently. Breathe slowly.</p>
                </div>
            </div>
        </footer>
    )
}
