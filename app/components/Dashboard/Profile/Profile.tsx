'use client'

import { useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import {
    fetchUser,
    toggleProfileVisibility,
} from '@/lib/store/dashboard/userProfileSlice'
import { getName } from 'country-list'
import AvatarSelection from './AvatarSelection'
import CountrySelector from './CountrySelector'

export default function Profile(props: any) {
    const [isPublic, setIsPublic] = useState(false)

    const userProfile = useSelector(
        (state: RootState) => state.userProfile.USERINFO
    )

    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        dispatch(fetchUser())
    }, [])

    useEffect(() => {
        if (userProfile) {
            setIsPublic(userProfile?.isPublic)
        }
    }, [userProfile])

    const joinedTime = (time: number) => {
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ]
        const jTime = new Date(time)
        const date = jTime.getDate()
        const year = jTime.getFullYear()
        const month = jTime.getMonth()
        const monthName = monthNames[month]
        // return { date, year, month, monthName }
        return `${date} ${monthName} ${year}`
    }

    const handleToggle = () => {
        setIsPublic(!isPublic)
        dispatch(toggleProfileVisibility(!isPublic ? 'public' : 'private'))
    }

    return (
        <div className="max-w-[1100px] mx-auto">
            {userProfile && (
                <div className="sun-card p-8 sm:p-10">
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-8">
                        <div className="col-span-full sm:col-span-2 flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-sun-orb -m-3 rounded-full animate-sun-pulse pointer-events-none" />
                                <div className="relative w-44 h-44 overflow-hidden rounded-3xl ring-2 ring-sun-600/30 shadow-warm">
                                    <img
                                        src={`/avatar/${userProfile.image.split('-')[0]}/${userProfile.image}.webp`}
                                        alt="avatar"
                                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                                    />
                                </div>
                            </div>
                            <AvatarSelection />
                        </div>

                        <div className="col-span-full sm:col-span-4 flex flex-col justify-center gap-5">
                            <div>
                                <span className="uppercase tracking-[0.18em] text-xs text-sun-700 font-semibold">
                                    Your profile
                                </span>
                                <h1 className="font-display text-4xl text-ink-900 mt-1">
                                    {userProfile.name}
                                </h1>
                                <span className="text-sm text-ink-700/70 font-mono">
                                    #{userProfile.userID}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                                {userProfile.country && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-100 border border-ink-900/8">
                                        <Image
                                            height={20}
                                            width={20}
                                            className="rounded-sm"
                                            src={`https://flagicons.lipis.dev/flags/4x3/${userProfile.country}.svg`}
                                            alt=""
                                        />
                                        <span className="text-sm text-ink-800">
                                            {getName(userProfile.country)}
                                        </span>
                                    </div>
                                )}
                                <CountrySelector
                                    isCountryAvailable={Boolean(
                                        userProfile.country
                                    )}
                                />
                            </div>

                            <span className="text-sm text-ink-700/80">
                                Member since{' '}
                                <strong className="text-ink-900">
                                    {joinedTime(userProfile.date)}
                                </strong>
                            </span>

                            <div className="flex items-center gap-3 pt-2">
                                <span className="text-sm font-medium text-ink-800">
                                    {isPublic ? 'Public' : 'Private'} account
                                </span>
                                <label className="flex cursor-pointer select-none items-center">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={isPublic}
                                            onChange={handleToggle}
                                            className="sr-only"
                                        />
                                        <div
                                            className={`block h-6 w-11 rounded-full transition ${isPublic ? 'bg-sage-600' : 'bg-ink-700/30'}`}
                                        />
                                        <div
                                            className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-soft transition transform ${isPublic ? 'translate-x-5' : ''}`}
                                        />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
