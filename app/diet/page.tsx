import { MealData, mealData } from '@/app/api/diet/mealData'
import DietInput from '@/app/components/Diet/DietInput'
import DietSearchNoResult from '@/app/components/Diet/DietSearchNoResult'
import DietCard from '@/app/components/Diet/DietCard'
import DietTags from '@/app/components/Diet/DietTags'
import { createClient } from '@/utils/supabase/server'
import NavbarDummy from '../components/Home/NavbarDummy'

export default async function Meals({
    searchParams,
}: {
    searchParams?: { search?: string; tag?: string } | undefined
}) {
    const tagParam = searchParams?.tag
    const search = searchParams?.search?.toLowerCase()
    const tag = tagParam ? tagParam.split(',') : null

    const filter = (tag: string[] | null, search: string | undefined) => {
        if (!tag && !search) {
            return mealData
        }

        return mealData
            .filter((item) =>
                tag ? tag.every((t) => item.tags.includes(t)) : true
            )
            .filter((item) =>
                search
                    ? item.name.toLowerCase().includes(search.toLowerCase()) ||
                      item.tags.includes(search.toLowerCase())
                    : true
            )
    }

    const filteredMeals = filter(tag, search)

    const supabase = createClient()

    const { data, error } = await supabase.from('food-data').select('*')

    const combineData = (
        meals: MealData[],
        data: any
    ): (MealData & { likes: number; views: number })[] => {
        // Guard against null/undefined (e.g. when Supabase env is missing or
        // the request errored) so the page still renders meals with zero stats.
        const rows: Array<{ id: number; likes: number; views: number }> =
            Array.isArray(data) ? data : []

        const likesAndViewsMap: Record<
            number,
            { likes: number; views: number }
        > = rows.reduce(
            (acc: any, item: any) => {
                acc[item.id] = { likes: item.likes, views: item.views }
                return acc
            },
            {} as Record<number, { likes: number; views: number }>
        )

        // Map meals to include likes and views
        return meals.map((meal) => ({
            ...meal,
            likes: likesAndViewsMap[meal.id]?.likes || 0,
            views: likesAndViewsMap[meal.id]?.views || 0,
        }))
    }

    const merge = combineData(filteredMeals, data)

    return (
        <div className="min-h-screen bg-cream-fade w-full pt-24 pb-12 px-4 sm:px-8 relative overflow-hidden">
            <NavbarDummy />
            <div className="absolute -top-32 -right-24 w-[32rem] h-[32rem] bg-sun-orb opacity-50 pointer-events-none animate-sun-pulse" />

            <div className="relative max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-xs uppercase tracking-[0.18em] text-sun-700 font-semibold">
                        Nourishment
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl text-ink-900 mt-2">
                        Healthy diet essentials
                    </h1>
                    <p className="mt-2 text-ink-700/80 max-w-xl mx-auto">
                        A small collection of meals to support your practice.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto mb-8">
                    <DietInput />
                </div>

                {search && (
                    <div className="mb-4 text-center">
                        <span className="text-sm text-ink-700/80">
                            Results for{' '}
                            <strong className="text-ink-900">
                                &ldquo;{search}&rdquo;
                            </strong>
                        </span>
                    </div>
                )}

                {tag && (
                    <div className="mb-6 flex flex-col items-center">
                        <span className="text-xs uppercase tracking-[0.18em] text-sun-700 font-semibold mb-2">
                            Filters
                        </span>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {tag.map((tag, idx) => (
                                <DietTags mealTag={tag} key={idx} />
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-6 justify-center">
                    {merge.length === 0 && <DietSearchNoResult />}
                    {merge.map((meal, idx: number) => (
                        <DietCard meals={meal} key={idx} />
                    ))}
                </div>
            </div>
        </div>
    )
}
