import Navbar from '../components/Home/Navbar'
import Leaderboard from '../components/LeaderBoard/Leaderboard'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
    return (
        <main className="min-h-screen w-full bg-cream-fade relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-[40rem] h-[40rem] bg-sun-orb opacity-60 animate-sun-pulse pointer-events-none" />
            <div className="absolute -bottom-40 -left-32 w-[36rem] h-[36rem] bg-sun-orb opacity-40 pointer-events-none" />
            <Navbar />
            <div className="relative z-10 flex justify-center pt-24 pb-12 px-4">
                <Leaderboard />
            </div>
        </main>
    )
}
