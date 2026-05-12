'use client'

import { MealData } from '@/app/api/diet/mealData'
import Image from 'next/image'
import { LuVegan } from 'react-icons/lu'
import { TbMeat } from 'react-icons/tb'
import DietDialog from './DietDialog'
import { useRouter } from 'next/navigation'
import DietUserLike from './DietUserLike'
import { MdArrowOutward } from 'react-icons/md'
import Link from 'next/link'

export default function DietCard(props: { meals: MealData }) {
    const meal = props?.meals
    const router = useRouter()

    const handleTagRoute = (tag: string) => {
        // overlay param in url is used to disconnect the main meal page from the next param page
        // problem without overlay is that whenever the new tag is added to url
        // and the user 'back' the page it takes long to navigate back to the main 'meal' page if there are nested tags

        const currentUrl = new URL(window.location.href)
        const searchParams = new URLSearchParams(currentUrl.search)
        const overlay = searchParams.get('overlay') || null

        const prevTag = searchParams.get('tag') || null

        searchParams.set('overlay', 'true')
        searchParams.set('tag', `${tag}${prevTag ? `,${prevTag}` : ''}`)

        const newUrl = `${currentUrl.pathname}?${searchParams.toString()}`
        overlay ? router.replace(newUrl) : router.push(newUrl)
    }

    return (
        <div className="flex flex-col w-full sm:w-72 xl:w-80 rounded-3xl bg-white border border-ink-900/8 shadow-soft hover:shadow-warm hover:-translate-y-1 duration-300 overflow-hidden group">
            <div className="w-full h-52 overflow-hidden bg-cream-100">
                <Image
                    src={`/meals/${meal.image}`}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    alt={meal.name}
                />
            </div>

            <div className="flex flex-col px-5 py-4 gap-3">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl text-ink-900 leading-tight">
                        {meal.name}
                    </h3>
                    {meal.vegetarian ? (
                        <span
                            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-sage-300/40 text-sage-700 shrink-0"
                            title="Vegetarian"
                        >
                            <LuVegan />
                        </span>
                    ) : (
                        <span
                            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-ember-500/10 text-ember-600 shrink-0"
                            title="Non-vegetarian"
                        >
                            <TbMeat />
                        </span>
                    )}
                </div>

                <span className="text-xs text-ink-700/70 uppercase tracking-wider">
                    {meal.meal_type}
                </span>

                <div className="flex flex-wrap gap-1.5">
                    {meal.tags.slice(0, 4).map((tag, idx1) => (
                        <button
                            onClick={() => handleTagRoute(tag)}
                            className="text-xs bg-cream-100 text-ink-700 hover:bg-sun-cta hover:text-white border border-ink-900/8 hover:border-transparent rounded-full px-3 py-0.5 capitalize duration-300"
                            key={idx1}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-2 mt-2">
                    <DietDialog meal={meal} />
                    <Link
                        href={`/diet/${meal.name.toLocaleLowerCase().replaceAll(' ', '-')}-${meal.id}`}
                    >
                        <button className="w-full inline-flex items-center justify-center gap-1 bg-sun-cta text-white rounded-full px-4 py-2 text-sm font-medium shadow-warm hover:opacity-95 duration-300">
                            Read more
                            <MdArrowOutward className="text-base" />
                        </button>
                    </Link>
                </div>
                <DietUserLike
                    mealId={meal.id}
                    mealLike={meal.likes}
                    mealViews={meal.views}
                />
            </div>
        </div>
    )
}
