'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Cookies from 'js-cookie'
import toast, { Toaster } from 'react-hot-toast'
import { FaApple, FaFacebookF } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { IoArrowBackOutline } from 'react-icons/io5'

import { oAuthSignIn } from './actions'
import ProviderUpdate from './ProvidesUpdate'

export default function LoginPage() {
    useEffect(() => {
        Cookies.remove('init')
    }, [])

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />

            <main className="relative min-h-screen w-full bg-cream-fade text-ink-900 overflow-hidden">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-sun-orb opacity-70 animate-sun-pulse"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-40 -left-40 w-[34rem] h-[34rem] bg-sun-orb opacity-40"
                />

                <div className="relative z-10 min-h-screen flex flex-col">
                    <header className="px-5 sm:px-10 pt-6">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-ink-800/75 hover:text-ember-600 transition-colors"
                        >
                            <IoArrowBackOutline className="text-base" />
                            Back home
                        </Link>
                    </header>

                    <div className="flex-1 flex items-center justify-center px-5 py-10 sm:py-16">
                        <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-[28px] overflow-hidden border border-ink-900/8 bg-cream-50 shadow-warm">
                            {/* Form */}
                            <section className="p-7 sm:p-10 flex flex-col gap-7">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center h-10 w-10 rounded-2xl bg-sun-cta text-ink-900 font-display font-bold shadow-warm">
                                        A
                                    </span>
                                    <span className="font-display text-lg text-ink-900">
                                        AsanaAI
                                    </span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <span className="text-[11px] uppercase tracking-[0.22em] text-sun-700 font-semibold">
                                        Begin where you are
                                    </span>
                                    <h1 className="font-display text-4xl sm:text-5xl text-ink-900 leading-[1.05]">
                                        Welcome back.
                                    </h1>
                                    <p className="text-ink-800/75 text-base leading-relaxed max-w-sm">
                                        Sign in to continue your practice. Your
                                        camera frames never leave your device —
                                        only your progress does.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <OAuthButton
                                        onClick={async () => {
                                            await oAuthSignIn('google')
                                        }}
                                        icon={<FcGoogle className="text-xl" />}
                                        label="Continue with Google"
                                    />
                                    <OAuthButton
                                        onClick={() =>
                                            toast.custom((t) =>
                                                ProviderUpdate(t, 'facebook')
                                            )
                                        }
                                        icon={
                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1877F2] text-white">
                                                <FaFacebookF className="text-xs" />
                                            </span>
                                        }
                                        label="Continue with Facebook"
                                        soon
                                    />
                                    <OAuthButton
                                        onClick={() =>
                                            toast.custom((t) =>
                                                ProviderUpdate(t, 'apple')
                                            )
                                        }
                                        icon={<FaApple className="text-xl text-ink-900" />}
                                        label="Continue with Apple"
                                        soon
                                    />
                                </div>

                                <p className="text-xs text-ink-700/55 leading-relaxed max-w-sm">
                                    By continuing you agree to our
                                    {' '}<Link href="/" className="underline underline-offset-2 hover:text-ember-600">terms</Link>{' '}
                                    and
                                    {' '}<Link href="/" className="underline underline-offset-2 hover:text-ember-600">privacy notice</Link>.
                                </p>
                            </section>

                            {/* Imagery */}
                            <aside className="relative hidden md:block bg-cream-100">
                                <div
                                    aria-hidden
                                    className="absolute inset-0 bg-sun-cta opacity-90"
                                />
                                <Image
                                    src="/pose/image/webp/tree.webp"
                                    alt=""
                                    width={720}
                                    height={900}
                                    sizes="(min-width: 768px) 50vw, 100vw"
                                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-ink-900/45 via-transparent to-transparent" />
                                <div className="relative h-full flex flex-col justify-end p-10 text-cream-50">
                                    <p className="font-display text-2xl sm:text-3xl leading-snug max-w-md">
                                        “The mind is everything. What you think
                                        you become.”
                                    </p>
                                    <span className="mt-3 text-sm uppercase tracking-[0.22em] text-cream-50/75">
                                        — Buddha
                                    </span>
                                </div>
                            </aside>
                        </div>
                    </div>

                    <footer className="px-5 sm:px-10 pb-6 text-center text-xs text-ink-700/55">
                        AsanaAI · breathe steady, move gentle.
                    </footer>
                </div>
            </main>
        </>
    )
}

function OAuthButton({
    icon,
    label,
    onClick,
    soon,
}: {
    icon: React.ReactNode
    label: string
    onClick: () => void
    soon?: boolean
}) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className="group relative inline-flex items-center justify-center gap-3 rounded-full border border-ink-900/12 bg-cream-50 px-5 py-3.5 text-ink-900 font-medium hover:border-ink-900/25 hover:bg-cream-100 active:scale-[0.99] transition-all min-h-[52px]"
        >
            <span className="inline-flex items-center justify-center w-6 h-6">
                {icon}
            </span>
            <span>{label}</span>
            {soon ? (
                <span className="absolute right-4 text-[10px] uppercase tracking-widest text-ink-700/55 hidden sm:inline">
                    Soon
                </span>
            ) : null}
        </button>
    )
}
