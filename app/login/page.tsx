'use client'
import AuthImageSlideShow from '../components/Auth/ImageSlideShow'

import { signIn, signUp } from './actions'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

export default function Page() {
    const [mode, setMode] = useState<'login' | 'signup'>('login')

    // remove toast notification
    useEffect(() => {
        Cookies.remove('init')
    }, [])

    const action = mode === 'login' ? signIn : signUp

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="min-h-screen flex justify-center items-center overflow-hidden bg-white">
                <div className="relative z-10 sm:grid flex flex-col-reverse sm:grid-cols-2  md:grid-rows-1 md:auto-rows-auto md:rounded-xl">
                    <div className="flex flex-col justify-evenly bg-slate-100 py-6 sm:py-5 sm:px-10 sm:rounded-l-2xl sm:rounded-r-none rounded-b-2xl shadow-xl">
                        <div className="flex flex-col gap-5 mx-10 sm:mx-0 sm:m-10 items-center">
                            <img src="/home/logo.svg" alt="" className="w-14" />
                            <span className="text-3xl text-slate-900 font-extrabold">
                                AsanaAI {mode === 'login' ? 'Login' : 'Signup'}
                            </span>
                        </div>

                        <form
                            action={action}
                            className="flex flex-col p-2 gap-4 m-5"
                        >
                            {mode === 'signup' && (
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="Name"
                                    className="border-[3px] rounded-2xl p-3 hover:border-slate-400 duration-300"
                                />
                            )}
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="Email"
                                className="border-[3px] rounded-2xl p-3 hover:border-slate-400 duration-300"
                            />
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                placeholder="Password (min 6 chars)"
                                className="border-[3px] rounded-2xl p-3 hover:border-slate-400 duration-300"
                            />
                            <button
                                type="submit"
                                className="flex justify-center items-center gap-5 border-[3px] rounded-2xl p-2 hover:border-slate-400 duration-300 cursor-pointer bg-blue-900 text-white"
                            >
                                <span className="text-xl font-semibold">
                                    {mode === 'login'
                                        ? 'Log In'
                                        : 'Create Account'}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setMode(mode === 'login' ? 'signup' : 'login')
                                }
                                className="text-sm text-slate-700 underline"
                            >
                                {mode === 'login'
                                    ? "Don't have an account? Sign up"
                                    : 'Already have an account? Log in'}
                            </button>
                        </form>

                        <div className="flex flex-col p-2 gap-5 mx-10">
                            AsanaAI Yoga Trainer
                        </div>
                    </div>

                    <div className="h-full overflow-hidden sm:rounded-r-2xl sm:rounded-l-none rounded-t-2xl shadow-xl">
                        <AuthImageSlideShow />
                    </div>
                </div>
            </div>
        </>
    )
}
