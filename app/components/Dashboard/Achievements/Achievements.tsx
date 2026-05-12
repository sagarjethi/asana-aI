'use client'

import {
    AchievementsData,
    achievementsData,
} from '@/app/api/achievements/achievementsData'
import { AppDispatch, RootState } from '@/lib/store'
import { fetchAchievement } from '@/lib/store/dashboard/dashboardSlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import './tooltip.css'
import { CiLock, CiUnlock } from 'react-icons/ci'
import Image from 'next/image'
import PageHeader from '@/app/components/Shell/PageHeader'

export default function Achievements() {
    const completed = useSelector(
        (state: RootState) => state.dashboard.ACHIEVEMENTS
    )
    const dispatch = useDispatch<AppDispatch>()

    const gender = 'women'
    const achievements = AchievementsData

    useEffect(() => {
        dispatch(fetchAchievement())
    }, [])

    const unlockedCount = achievements.filter((a) =>
        completed?.includes(a.id)
    ).length

    return (
        <div className="max-w-[1500px] mx-auto">
            <PageHeader
                eyebrow="Milestones"
                title="Achievements"
                description="Each one a marker of practice over time."
                right={
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sun-cta text-white text-sm font-medium shadow-warm">
                        <CiUnlock className="text-lg" />
                        {unlockedCount} / {achievements.length}
                    </div>
                }
            />

            <div className="sun-card p-6 sm:p-10">
                <div className="flex flex-wrap justify-center gap-4">
                    {achievements.map((item: achievementsData, key) => {
                        const unlocked = completed?.includes(item.id)
                        return (
                            <div
                                data-tooltip-id={`tooltip-${key}`}
                                key={key}
                                className={`relative has-tooltip rounded-full cursor-pointer transition duration-500 ${
                                    unlocked
                                        ? 'ring-2 ring-sun-600/40 hover:ring-sun-600 hover:shadow-warm hover:-translate-y-0.5'
                                        : 'opacity-60 hover:opacity-100'
                                }`}
                            >
                                <Image
                                    src={`/achievements/${item.icon}-${gender}.webp`}
                                    width={144}
                                    height={144}
                                    alt={item.name}
                                    className={`2xl:w-36 sm:w-32 w-24 h-auto rounded-full object-cover shadow-soft duration-500 ${
                                        unlocked
                                            ? 'brightness-100'
                                            : 'brightness-[.40] grayscale'
                                    }`}
                                />
                                {unlocked && (
                                    <span className="absolute -bottom-1 -right-1 h-7 w-7 flex items-center justify-center rounded-full bg-sage-600 text-white shadow-soft">
                                        <CiUnlock className="text-base" />
                                    </span>
                                )}
                                <Tooltip
                                    id={`tooltip-${key}`}
                                    className="place-tooltip animate-fade-up"
                                >
                                    <div className="flex flex-col m-2 max-w-[260px]">
                                        <span className="font-display text-ink-900 text-lg">
                                            {item.name}
                                        </span>
                                        <span className="text-ink-800 text-sm mt-1">
                                            {item.description}
                                        </span>
                                        <div className="flex flex-col gap-1 text-ink-700 mt-3 capitalize text-xs">
                                            <span>
                                                <strong>Level</strong> —{' '}
                                                {item.level}
                                            </span>
                                            <span>
                                                <strong>Rarity</strong> —{' '}
                                                {item.rarity}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <strong>Status</strong> —{' '}
                                                {unlocked ? (
                                                    <>
                                                        Unlocked
                                                        <CiUnlock />
                                                    </>
                                                ) : (
                                                    <>
                                                        Locked
                                                        <CiLock />
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </Tooltip>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
