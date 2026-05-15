'use client'

import './dashboard.css'
import { BsLightningCharge } from 'react-icons/bs'
import Calendar from './Calendar'
import RecentActivity from './RecentActivity'
import Heading from './Heading'
import dynamic from 'next/dynamic'

const LastTHDays = dynamic(() => import('./LastTHDays'), {
    ssr: false,
    loading: () => (
        <div className="h-[20vh] w-full bg-cream-200 rounded-2xl animate-pulse" />
    ),
})
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    fetchDashboardAPI,
    fetchRecentActivity,
    fetchYogaPoseAPI,
} from '@/lib/store/dashboard/dashboardSlice'
import { AppDispatch, RootState } from '@/lib/store'
import { RxActivityLog } from 'react-icons/rx'
import Link from 'next/link'
import PageHeader from '@/app/components/Shell/PageHeader'

const wishes = (time: string, name: string) => {
    switch (time) {
        case 'Morning':
            return `Good morning, ${name}. Greet the sun.`
        case 'Midday':
            return `Hey ${name} — a midday breath to reset.`
        case 'Evening':
            return `Good evening, ${name}. Unwind with intention.`
        case 'Afternoon':
            return `Hello, ${name}. A short flow can change the day.`
        case 'Night':
            return `Hey ${name} — wind down before rest.`
        default:
            return `Hello, ${name}. Step onto the mat.`
    }
}

const getHour = () => {
    const hours = new Date().getHours()
    if (hours >= 5 && hours < 12) return 'Morning'
    if (hours >= 12 && hours < 17) return 'Midday'
    if (hours >= 17 && hours < 20) return 'Evening'
    if (hours >= 20 && hours < 22) return 'Night'
    return 'Afternoon'
}

function DashboardSkeleton() {
    return (
        <div className="grid grid-cols-12 gap-5">
            <div className="col-span-full xl:col-span-4 min-h-[40vh] bg-cream-200 animate-pulse rounded-3xl" />
            <div className="col-span-full xl:col-span-5 min-h-[40vh] bg-cream-200 animate-pulse rounded-3xl" />
            <div className="col-span-full xl:col-span-3 min-h-[40vh] bg-cream-200 animate-pulse rounded-3xl" />
            <div className="col-span-full xl:col-span-9 min-h-[40vh] bg-cream-200 animate-pulse rounded-3xl" />
            <div className="col-span-full xl:col-span-3 min-h-[40vh] bg-cream-200 animate-pulse rounded-3xl" />
        </div>
    )
}

export default function Dashboard(name: any) {
    const dashboardData = useSelector(
        (state: RootState) => state.dashboard.data
    )
    const poseInfo = useSelector((state: RootState) => state.dashboard.POSEDATA)
    const recentActivities = useSelector(
        (state: RootState) => state.dashboard.RECENTACT
    )
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        dispatch(fetchDashboardAPI())
    }, [dispatch])

    useEffect(() => {
        if (dashboardData) {
            dispatch(fetchYogaPoseAPI(dashboardData?.todayPoseList.toString()))
            dispatch(
                fetchRecentActivity(
                    dashboardData?.userRecentActivity.toString()
                )
            )
        }
    }, [dashboardData])

    const firstName = (name?.name ?? '').split(' ')[0] || 'friend'

    return (
        <div className="max-w-[1500px] mx-auto">
            <PageHeader
                eyebrow="Your space"
                title="Dashboard"
                description="A quiet overview of your practice today."
                showDate
            />

            {!dashboardData || !poseInfo || !recentActivities ? (
                <DashboardSkeleton />
            ) : (
                <div className="grid grid-cols-12 gap-5">
                    {/* welcome */}
                    <div className="col-span-full xl:col-span-4 rounded-3xl overflow-hidden anim-blob border border-ink-900/8 min-h-[40vh] flex flex-col items-center justify-center p-6 relative">
                        <div className="absolute -top-10 -right-10 w-56 h-56 bg-sun-orb opacity-90 animate-sun-pulse pointer-events-none" />
                        <div className="w-40 relative z-10">
                            <img
                                src="/dashboard/meditation.gif"
                                alt="yoga"
                                className="mix-blend-multiply"
                            />
                        </div>
                        <p className="relative z-10 text-center font-display text-xl text-ink-900 mt-4 max-w-xs leading-snug">
                            {wishes(getHour(), firstName)}
                        </p>
                    </div>

                    {/* today list */}
                    <div className="col-span-full xl:col-span-5 sun-card p-5 min-h-[40vh] flex flex-col">
                        <Heading
                            title="Today's flow"
                            description="A handful of poses to move through."
                        />
                        <div className="flex flex-col gap-3 flex-1">
                            {poseInfo?.map((item: any, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-cream-50 border border-ink-900/6 hover:border-sun-600/40 hover:shadow-soft duration-300 p-3"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-cream-100 flex items-center justify-center">
                                            <img
                                                className="object-contain mix-blend-multiply w-full h-full"
                                                src={`/pose/image/webp/${item?.image}`}
                                                alt={item.name}
                                            />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-display text-base text-ink-900 capitalize truncate">
                                                {item.name}
                                            </span>
                                            <span className="text-xs text-ink-700/70 capitalize truncate">
                                                {item.originalName}
                                            </span>
                                        </div>
                                    </div>
                                    <Link href={`/practice?id=${item.id}`}>
                                        <button className="inline-flex items-center gap-2 rounded-full bg-sun-cta text-white px-4 py-2 text-sm font-medium shadow-warm hover:opacity-95 duration-300">
                                            Practice
                                            <BsLightningCharge />
                                        </button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* calendar */}
                    <div className="col-span-full xl:col-span-3 sun-card p-5 min-h-[40vh] flex flex-col">
                        <Heading
                            title="Active days"
                            description="Highlighted dates show your practice."
                        />
                        <div className="flex justify-center -mt-2">
                            <Calendar
                                epochTimes={dashboardData.userActiveDays}
                            />
                        </div>
                    </div>

                    {/* recent activity */}
                    <div className="col-span-full xl:col-span-9 sun-card p-5 min-h-[40vh]">
                        <Heading
                            title="Recent activity"
                            description="What you've been moving through lately."
                        />
                        {recentActivities.length !== 0 ? (
                            <RecentActivity
                                recentActivities={recentActivities}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 py-12 text-ink-700/60">
                                <RxActivityLog className="text-4xl" />
                                <span className="font-display text-lg">
                                    No recent activity yet
                                </span>
                            </div>
                        )}
                    </div>

                    {/* last 30 days */}
                    <div className="col-span-full xl:col-span-3 sun-card p-5 min-h-[40vh] flex flex-col">
                        <Heading
                            title="Last 30 days"
                            description="Your activity trend."
                        />
                        <div className="flex-1 flex justify-center items-center">
                            <LastTHDays
                                chartData={dashboardData.userLastNDaysActivity}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
