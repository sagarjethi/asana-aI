'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RiDashboardFill, RiMenu5Line } from 'react-icons/ri'
import { IoMdHome } from 'react-icons/io'
import { IoCloseOutline } from 'react-icons/io5'
import Preferences from './Preferences'
import '@/app/components/Yoga/yoga.css'

export default function Menu() {
    const [open, setOpen] = useState<boolean>(false)

    return (
        <div
            // Touch + keyboard friendly: click or focus to open, blur/hover-out to close.
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className={`flex gap-2 p-1 bg-cream-50/95 border border-ink-900/8 rounded-2xl shadow-soft justify-center items-center z-[300] ${
                open ? 'animate-fade-left flex-row-reverse' : ''
            }`}
        >
            <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-cream-100 active:scale-95 transition"
            >
                {open ? (
                    <IoCloseOutline className="text-2xl text-ink-900" />
                ) : (
                    <RiMenu5Line className="text-2xl text-ink-900" />
                )}
            </button>

            <div
                className={`flex gap-1 items-center ${open ? 'flex' : 'hidden'}`}
            >
                <Link
                    href="/"
                    aria-label="Home"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-cream-100 transition"
                >
                    <IoMdHome className="text-2xl text-ink-900 hover:scale-110 duration-300" />
                </Link>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-cream-100 transition">
                    <Preferences />
                </div>
                <Link
                    href="/dashboard"
                    aria-label="Dashboard"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-cream-100 transition"
                >
                    <RiDashboardFill className="text-2xl text-ink-900 hover:scale-110 duration-300" />
                </Link>
            </div>
        </div>
    )
}
