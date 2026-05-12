'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Cookies from 'js-cookie'
import toast, { Toaster } from 'react-hot-toast'
import { RxHamburgerMenu } from 'react-icons/rx'
import { IoCloseOutline } from 'react-icons/io5'
import { createClientBrowser } from '@/utils/supabase/client'

const NAV_LINKS = [
    { name: 'Practice', href: '/practice' },
    { name: 'Poses', href: '/practice' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Diet', href: '/diet' },
]

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [isAuth, setIsAuth] = useState(false)
    const supabase = createClientBrowser()

    const validateUserCookie = async () => {
        const { data: user } = await supabase.auth.getSession()
        if (!user.session) return

        setIsAuth(true)

        const userPromise: Promise<typeof user> = new Promise((resolve) => {
            resolve(user)
        })

        if (Cookies.get('init') === undefined) {
            toast.promise(
                userPromise,
                {
                    loading: 'Loading…',
                    success: (
                        <b>
                            Welcome back,{' '}
                            {user.session?.user?.user_metadata?.name ?? 'yogi'}
                        </b>
                    ),
                    error: <b>Couldn&apos;t authenticate.</b>,
                },
                {
                    duration: 2200,
                    icon: '🧘',
                    style: {
                        borderRadius: '12px',
                        background: '#241914',
                        color: '#FFFBF4',
                    },
                }
            )
            Cookies.set('init', '0')
        }
    }

    useEffect(() => {
        validateUserCookie()
    }, [])

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />

            <nav className="z-50 sticky top-4 mx-4 sm:mx-8">
                <div className="flex items-center justify-between rounded-full border border-ink-900/10 bg-cream-50/80 backdrop-blur-md px-4 py-2 shadow-soft">
                    <Link href="/" className="flex items-center gap-2 pl-2">
                        <div className="w-9 h-9 rounded-full bg-sun-cta flex items-center justify-center text-ink-900 font-display font-bold">
                            A
                        </div>
                        <span className="font-display text-xl font-semibold text-ink-900">
                            AsanaAI
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6 text-sm text-ink-800/80">
                        {NAV_LINKS.map((l) => (
                            <Link
                                key={l.name}
                                href={l.href}
                                className="hover:text-ember-600 transition-colors"
                            >
                                {l.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={isAuth ? '/dashboard' : '/login'}
                            className="hidden sm:inline-flex rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-ember-600 transition-colors"
                        >
                            {isAuth ? 'Dashboard' : 'Sign in'}
                        </Link>
                        <button
                            onClick={() => setIsOpen((s) => !s)}
                            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink-900 text-cream-50"
                            aria-label="Toggle navigation"
                        >
                            {isOpen ? (
                                <IoCloseOutline className="text-xl" />
                            ) : (
                                <RxHamburgerMenu className="text-xl" />
                            )}
                        </button>
                    </div>
                </div>

                {isOpen && (
                    <div className="md:hidden mt-3 rounded-3xl border border-ink-900/10 bg-cream-50/95 backdrop-blur-md p-4 shadow-soft">
                        <div className="flex flex-col gap-1">
                            {NAV_LINKS.map((l) => (
                                <Link
                                    key={l.name}
                                    href={l.href}
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 rounded-2xl text-ink-800 hover:bg-cream-200 transition-colors"
                                >
                                    {l.name}
                                </Link>
                            ))}
                            <Link
                                href={isAuth ? '/dashboard' : '/login'}
                                onClick={() => setIsOpen(false)}
                                className="mt-2 px-4 py-3 rounded-full bg-ink-900 text-cream-50 text-center"
                            >
                                {isAuth ? 'Dashboard' : 'Sign in'}
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </>
    )
}
