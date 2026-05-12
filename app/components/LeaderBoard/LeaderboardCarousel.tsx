import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'
import Image from 'next/image'
import LeaderboardStats from './LeaderboardStats'

export default function LeaderboardCarousel({ userData }: { userData: any }) {
    return (
        <div className="w-full flex justify-center items-center bg-cream-100/70 rounded-3xl border border-ink-900/8 p-5">
            <Carousel className="w-full max-w-xs flex items-center">
                <CarouselContent>
                    {userData?.metrics
                        ?.slice(0, 3)
                        .map((data: any, idx: number) => {
                            const medal =
                                idx === 0
                                    ? 'gold'
                                    : idx === 1
                                      ? 'silver'
                                      : 'bronze'
                            return (
                                <CarouselItem key={idx}>
                                    <div className="p-3 flex flex-col gap-3 justify-center items-center">
                                        <div className="relative">
                                            <div className="absolute -inset-3 bg-sun-orb pointer-events-none animate-sun-pulse" />
                                            <div className="relative w-32 h-32 overflow-hidden rounded-full ring-2 ring-sun-600/40 shadow-warm">
                                                <Image
                                                    height={0}
                                                    width={0}
                                                    sizes="100vw"
                                                    src={`/avatar/${data.userInfo.profile_pic.split('-')[0]}/${data.userInfo.profile_pic}.webp`}
                                                    alt="avatar"
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="relative flex items-center gap-2">
                                            <Image
                                                src={`/leaderboard/${medal}.png`}
                                                alt={medal}
                                                height={32}
                                                width={32}
                                            />
                                            {data.userInfo.country && (
                                                <div className="rounded-md overflow-hidden">
                                                    <Image
                                                        height={32}
                                                        width={32}
                                                        alt={
                                                            data.userInfo
                                                                .country
                                                        }
                                                        src={`https://flagicons.lipis.dev/flags/4x3/${data.userInfo.country}.svg`}
                                                        className="shadow-soft"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <span className="font-display text-xl text-ink-900 text-center">
                                            {data.userInfo.name}
                                        </span>

                                        <div className="flex flex-col w-full">
                                            <LeaderboardStats
                                                accuracy={data.correctPoseMean}
                                                timeSpent={data.durationMean}
                                                session={data.totalSessions}
                                            />
                                        </div>
                                    </div>
                                </CarouselItem>
                            )
                        })}
                </CarouselContent>
                <CarouselPrevious className="bg-ink-900 text-white border-0 hover:bg-ink-800 hover:text-white" />
                <CarouselNext className="bg-ink-900 text-white border-0 hover:bg-ink-800 hover:text-white" />
            </Carousel>
        </div>
    )
}
