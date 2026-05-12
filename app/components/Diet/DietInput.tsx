'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export default function DietInput() {
    const router = useRouter()

    const debounce = (func: Function, delay: number) => {
        let timer: NodeJS.Timeout
        return (...args: any[]) => {
            clearTimeout(timer)
            timer = setTimeout(() => {
                func(...args)
            }, delay)
        }
    }

    const debouncedHandleURL = useCallback(
        debounce((value: string) => {
            const currentUrl = new URL(window.location.href)
            const searchParams = new URLSearchParams(currentUrl.search)
            const overlay = searchParams.get('overlay') || null

            searchParams.set('overlay', 'true')
            searchParams.set('search', value)

            const newUrl = `${currentUrl.pathname}?${searchParams.toString()}`

            if (overlay) {
                router.replace(newUrl)
            } else {
                router.push(newUrl)
            }
        }, 1000),
        [router]
    )

    const handleURL = (e: any) => {
        e.preventDefault()
        debouncedHandleURL(e.target.value)
    }

    return (
        <div className="w-full flex justify-center items-center">
            <input
                onChange={handleURL}
                type="text"
                placeholder="Search meals, tags, ingredients..."
                className="outline-none w-full max-w-md bg-white border border-ink-900/10 focus:border-sun-600/60 focus:ring-2 focus:ring-sun-600/20 py-3 px-5 rounded-full text-ink-800 placeholder:text-ink-700/50 shadow-soft duration-300"
            />
        </div>
    )
}
