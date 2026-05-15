import Image from 'next/image'
import { getName } from 'country-list'
import { createClient } from '@/utils/supabase/server'
import { AchievementsData } from '@/app/api/achievements/achievementsData'
import Link from 'next/link'

const USERDB = process.env.NEXT_PUBLIC_SUPABASE_DATABASE_USER_PROFILE!

export default async function Profile({ params }: any) {
    const searchParam = params.id

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
        return `${date} ${monthName} ${year}`
    }

    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Without a configured USERDB the query crashes the route. Fall through
    // to the "no user found" empty state instead.
    let data: any = null
    if (USERDB) {
        const result = await supabase
            .from(USERDB)
            .select('*')
            .eq('user_public_id', searchParam)
            .single()
        data = result.data
    }

    const achievement =
        data?.achievements &&
        AchievementsData.filter(
            (item) => data.achievements.includes(item.id) || null
        )

    const gender = 'men'

    return (
        <>
            {data?.profile_type === 'public' && (
                <div className="min-h-screen flex justify-center items-center bg-cream-fade relative overflow-hidden p-4">
                    <div className="absolute -top-32 -right-32 w-[40rem] h-[40rem] bg-sun-orb opacity-50 animate-sun-pulse pointer-events-none" />
                    <div className="relative grid bg-white w-11/12 sm:w-3/4 xl:w-2/3 grid-cols-1 md:grid-cols-6 p-8 rounded-3xl border border-ink-900/8 shadow-warm gap-6">
                        <div className="md:col-span-2 flex flex-col justify-center items-center">
                            <div className="relative">
                                <div className="absolute -inset-3 bg-sun-orb pointer-events-none animate-sun-pulse" />
                                <div className="relative w-48 h-48 sm:w-56 sm:h-56 overflow-hidden rounded-3xl ring-2 ring-sun-600/30 shadow-warm">
                                    <img
                                        src={`/avatar/${data.profile_pic.split('-')[0]}/${data.profile_pic}.webp`}
                                        alt="avatar"
                                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-4 flex flex-col justify-center md:items-start items-center gap-4">
                            <div>
                                <span className="uppercase tracking-[0.18em] text-xs text-sun-700 font-semibold">
                                    Member
                                </span>
                                <h1 className="font-display text-4xl text-ink-900 mt-1">
                                    {data.name}
                                </h1>
                                <span className="text-sm text-ink-700/70 font-mono">
                                    #{data.user_public_id}
                                </span>
                            </div>

                            {data.country && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-100 border border-ink-900/8">
                                    <Image
                                        height={20}
                                        width={20}
                                        className="rounded-sm"
                                        src={`https://flagicons.lipis.dev/flags/4x3/${data.country}.svg`}
                                        alt=""
                                    />
                                    <span className="text-sm text-ink-800">
                                        {getName(data.country)}
                                    </span>
                                </div>
                            )}

                            <span className="text-sm text-ink-700/80">
                                Member since{' '}
                                <strong className="text-ink-900">
                                    {joinedTime(data.created_at)}
                                </strong>
                            </span>

                            {achievement && achievement.length > 0 && (
                                <div className="w-full">
                                    <span className="text-xs uppercase tracking-[0.18em] text-sun-700 font-semibold mb-2 block">
                                        Achievements
                                    </span>
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                        {achievement.map(
                                            (item: any, key: number) => (
                                                <div
                                                    key={key}
                                                    title={item.name}
                                                    className="rounded-full ring-2 ring-sun-600/30 hover:ring-sun-600 hover:-translate-y-0.5 duration-300 overflow-hidden"
                                                >
                                                    <Image
                                                        src={`/achievements/${item.icon}-${gender}.webp`}
                                                        width={72}
                                                        height={72}
                                                        alt="Achievement"
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {(!data || data?.profile_type === 'private') && (
                <div className="min-h-screen flex justify-center items-center bg-cream-fade p-4">
                    <div className="flex flex-col gap-6 justify-center items-center bg-white w-11/12 sm:w-3/4 xl:w-1/3 p-10 rounded-3xl border border-ink-900/8 shadow-warm text-center">
                        <img
                            src="https://img.icons8.com/pulsar-gradient/96/user-not-found.png"
                            alt="no-user-found"
                            className="w-20 opacity-90"
                        />
                        <span className="font-display text-2xl text-ink-900">
                            No user found with the tag{' '}
                            <span className="text-sun-700">
                                #{searchParam || null}
                            </span>
                        </span>
                        <Link href={'/'}>
                            <button className="bg-sun-cta text-white px-6 py-2 rounded-full font-medium shadow-warm hover:opacity-95 duration-300">
                                Back home
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </>
    )
}
