import axios from 'axios'
import LeaderboardCarousel from './LeaderboardCarousel'
import LeaderboardDisplay from './LeaderboardDisplay'

const ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT

export default async function Leaderboard() {

    const response = await axios.get(`${ENDPOINT}/api/leaderboard`) // call
    const data = response.data 


    return (
        <div className="z-10 w-full max-w-6xl">
            <div className="sun-card p-5 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
                    <div>
                        <span className="text-xs uppercase tracking-[0.18em] text-sun-700 font-semibold">
                            Community
                        </span>
                        <h1 className="font-display text-3xl sm:text-4xl text-ink-900 mt-1">
                            Leaderboard
                        </h1>
                    </div>
                    <span className="text-sm text-ink-700/70">
                        How the community is showing up this week.
                    </span>
                </div>

                <div className="grid xl:grid-cols-6 gap-6 w-full">
                    <div className="xl:col-span-2 flex items-center justify-center">
                        {data ? (
                            <LeaderboardCarousel userData={data} />
                        ) : (
                            <div className="h-72 w-full bg-cream-200 rounded-3xl animate-pulse" />
                        )}
                    </div>

                    <div className="xl:col-span-4 w-full flex flex-col gap-3">
                        <LeaderboardDisplay data={data?.metrics} />
                    </div>
                </div>
            </div>
        </div>
    )
}
