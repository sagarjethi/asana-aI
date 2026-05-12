'use client'
import Heading from '@/app/components/Dashboard/Page/Heading'
import WeekActivity from './WeekActivity'
import DaySpent from './DaysSpent'
import Accuracy from './Accuracy'
import AreaOfInterest from './AreaOfInterest'
import PerformanceAOI from './PerformanceAOI'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { useEffect } from 'react'
import { fetchStats } from '@/lib/store/dashboard/dashboardSlice'
import PageHeader from '@/app/components/Shell/PageHeader'

export default function StatsDashboard() {
    const userStats = useSelector((state: RootState) => state.dashboard.STATS)
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        dispatch(fetchStats())
    }, [])

    return (
        <div className="max-w-[1500px] mx-auto">
            <PageHeader
                eyebrow="Your progress"
                title="Stats"
                description="A view of the patterns in your practice."
                showDate
            />

            {userStats ? (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-full xl:col-span-6 sun-card p-5 min-h-[45vh] flex flex-col">
                        <Heading
                            title="Weekly activity"
                            description="How your practice spreads across the week."
                        />
                        <div className="animate-fade-up flex-1 w-full">
                            <WeekActivity
                                weeklyActivity={userStats.weeklyActivity}
                            />
                        </div>
                    </div>

                    <div className="col-span-full xl:col-span-6 sun-card p-5 min-h-[45vh] flex flex-col">
                        <Heading
                            title="Last 30 days"
                            description="Active vs inactive days."
                        />
                        <div className="flex-1 flex justify-center items-center">
                            <DaySpent activeInMonth={userStats.activeInMonth} />
                        </div>
                    </div>

                    <div className="col-span-full sun-card p-5 min-h-[50vh] max-h-[100vh] flex flex-col">
                        <Heading
                            title="Performance"
                            description="Accuracy across your recent sessions."
                        />
                        <div className="animate-fade-up flex-1 w-full">
                            <Accuracy performanceData={userStats.performance} />
                        </div>
                    </div>

                    <div className="col-span-full xl:col-span-6 sun-card p-5 min-h-[50vh] flex flex-col">
                        <Heading
                            title="Areas of interest"
                            description="The poses you return to most."
                        />
                        <div className="flex-1 flex justify-center items-center">
                            <AreaOfInterest
                                areaOfInterest={userStats.areaOfInterest}
                            />
                        </div>
                    </div>

                    <div className="col-span-full xl:col-span-6 sun-card p-5 min-h-[50vh] flex flex-col">
                        <Heading
                            title="Performance per pose"
                            description="Where you're most aligned."
                        />
                        <div className="flex-1 flex justify-center items-center">
                            <PerformanceAOI
                                areaOfInterest={userStats.areaOfInterest}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-full xl:col-span-6 min-h-[45vh] bg-cream-200 animate-pulse rounded-3xl" />
                    <div className="col-span-full xl:col-span-6 min-h-[45vh] bg-cream-200 animate-pulse rounded-3xl" />
                    <div className="col-span-full min-h-[50vh] bg-cream-200 animate-pulse rounded-3xl" />
                    <div className="col-span-full xl:col-span-6 min-h-[50vh] bg-cream-200 animate-pulse rounded-3xl" />
                    <div className="col-span-full xl:col-span-6 min-h-[50vh] bg-cream-200 animate-pulse rounded-3xl" />
                </div>
            )}
        </div>
    )
}
