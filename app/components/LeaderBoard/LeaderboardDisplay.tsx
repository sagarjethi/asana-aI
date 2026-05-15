import { ScrollArea } from '@/components/ui/scroll-area'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import LeaderboardStats from './LeaderboardStats'

const WeeklyActivity = dynamic(() => import('./WeeklyActivity'), {
    loading: () => <div className="h-16 w-16" />,
})

export default async function LeaderboardDisplay({ data }: { data: any }) {
    return (
        <ScrollArea
            data-lenis-prevent
            className="sm:h-[26rem] w-full rounded-2xl"
        >
            <div className="flex flex-col gap-2">
                {data &&
                    data?.map((metric: any, idx: number) => {
                        const isTop3 = idx < 3
                        return (
                            <div
                                key={idx}
                                className={`flex flex-col sm:flex-row gap-4 sm:items-center bg-cream-50 border rounded-2xl p-3 hover:-translate-y-0.5 hover:shadow-soft duration-300 ${
                                    isTop3
                                        ? 'border-sun-600/30'
                                        : 'border-ink-900/8'
                                }`}
                            >
                                <div className="flex items-center gap-3 sm:w-8 shrink-0">
                                    {isTop3 ? (
                                        <Image
                                            src={`/leaderboard/${idx + 1 === 1 ? 'gold' : idx + 1 === 2 ? 'silver' : 'bronze'}.png`}
                                            alt="medal"
                                            height={28}
                                            width={28}
                                        />
                                    ) : (
                                        <span className="font-display text-lg text-ink-700/70 w-7 text-center">
                                            {idx + 1}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-12 h-12 shrink-0 overflow-hidden rounded-full ring-1 ring-sun-600/30">
                                        <Image
                                            height={0}
                                            width={0}
                                            sizes="100vw"
                                            src={`/avatar/${metric.userInfo.profile_pic.split('-')[0]}/${metric.userInfo.profile_pic}.webp`}
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-display text-base text-ink-900 truncate">
                                                {metric.userInfo.name}
                                            </span>
                                            {metric.userInfo.country && (
                                                <Image
                                                    height={16}
                                                    width={22}
                                                    alt={metric.userInfo.country}
                                                    src={`https://flagicons.lipis.dev/flags/4x3/${metric.userInfo.country}.svg`}
                                                    className="rounded-sm shrink-0"
                                                />
                                            )}
                                        </div>

                                        <LeaderboardStats
                                            accuracy={metric.correctPoseMean}
                                            timeSpent={metric.durationMean}
                                            session={metric.totalSessions}
                                        />
                                    </div>
                                </div>

                                <div className="w-16 h-12 flex justify-center items-center shrink-0">
                                    <WeeklyActivity
                                        chartData={metric.weekActivity}
                                    />
                                </div>
                            </div>
                        )
                    })}

                {!data &&
                    Array.from({ length: 10 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="h-20 bg-cream-200 rounded-2xl animate-pulse"
                        />
                    ))}
            </div>
        </ScrollArea>
    )
}
