'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Cookies from 'js-cookie'
import { Toaster } from 'react-hot-toast'
import { IoArrowBackOutline, IoArrowForwardOutline } from 'react-icons/io5'

import { signIn, signUp } from './actions'

type Mode = 'login' | 'signup'

export default function LoginPage() {
    const params = useSearchParams()
    const message = params.get('message')
    const [mode, setMode] = useState<Mode>('login')

    useEffect(() => {
        Cookies.remove('init')
    }, [])

    const isLogin = mode === 'login'
    const action = isLogin ? signIn : signUp

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
                                        {isLogin
                                            ? 'Begin where you are'
                                            : 'Start your practice'}
                                    </span>
                                    <h1 className="font-display text-4xl sm:text-5xl text-ink-900 leading-[1.05]">
                                        {isLogin
                                            ? 'Welcome back.'
                                            : 'Roll out your mat.'}
                                    </h1>
                                    <p className="text-ink-800/75 text-base leading-relaxed max-w-sm">
                                        {isLogin
                                            ? 'Sign in to continue your practice. Your camera frames never leave your device — only your progress does.'
                                            : 'Create an account to save your sessions and track progress over time.'}
                                    </p>
                                </div>

                                {message && (
                                    <div
                                        role="alert"
                                        className="rounded-2xl border border-ember-500/30 bg-ember-500/10 text-ember-700 text-sm px-4 py-3"
                                    >
                                        {message}
                                    </div>
                                )}

                                <form
                                    action={action}
                                    className="flex flex-col gap-3"
                                >
                                    {!isLogin && (
                                        <Field
                                            name="name"
                                            type="text"
                                            label="Name"
                                            autoComplete="name"
                                        />
                                    )}
                                    <Field
                                        name="email"
                                        type="email"
                                        label="Email"
                                        autoComplete="email"
                                        required
                                    />
                                    <Field
                                        name="password"
                                        type="password"
                                        label="Password"
                                        autoComplete={
                                            isLogin
                                                ? 'current-password'
                                                : 'new-password'
                                        }
                                        required
                                        minLength={6}
                                        hint={
                                            !isLogin
                                                ? 'At least 6 characters'
                                                : undefined
                                        }
                                    />

                                    <button
                                        type="submit"
                                        className="group mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-6 py-3.5 text-cream-50 font-medium shadow-warm hover:bg-ember-600 active:scale-[0.99] transition min-h-[52px]"
                                    >
                                        {isLogin ? 'Log in' : 'Create account'}
                                        <IoArrowForwardOutline className="transition-transform group-hover:translate-x-1" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMode(isLogin ? 'signup' : 'login')
                                        }
                                        className="text-sm text-ink-700/75 hover:text-ember-600 transition-colors mt-1"
                                    >
                                        {isLogin
                                            ? "Don't have an account? "
                                            : 'Already have an account? '}
                                        <span className="underline underline-offset-2">
                                            {isLogin ? 'Sign up' : 'Log in'}
                                        </span>
                                    </button>
                                </form>

                                <p className="text-xs text-ink-700/55 leading-relaxed max-w-sm">
                                    By continuing you agree to our{' '}
                                    <Link
                                        href="/"
                                        className="underline underline-offset-2 hover:text-ember-600"
                                    >
                                        terms
                                    </Link>{' '}
                                    and{' '}
                                    <Link
                                        href="/"
                                        className="underline underline-offset-2 hover:text-ember-600"
                                    >
                                        privacy notice
                                    </Link>
                                    .
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

function Field({
    name,
    type,
    label,
    autoComplete,
    required,
    minLength,
    hint,
}: {
    name: string
    type: string
    label: string
    autoComplete?: string
    required?: boolean
    minLength?: number
    hint?: string
}) {
    return (
        <label className="flex flex-col gap-1.5 text-sm text-ink-800/85">
            <span>{label}</span>
            <input
                name={name}
                type={type}
                autoComplete={autoComplete}
                required={required}
                minLength={minLength}
                className="rounded-2xl border border-ink-900/12 bg-cream-50 px-4 py-3 text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-sun-600 focus:ring-2 focus:ring-sun-600/20 transition"
            />
            {hint && (
                <span className="text-xs text-ink-700/55 mt-0.5">{hint}</span>
            )}
        </label>
    )
}
