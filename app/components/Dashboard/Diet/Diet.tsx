'use client'

import { useDispatch, useSelector } from 'react-redux'
import DietAddForm from './DietAddForm'
import { AppDispatch, RootState } from '@/lib/store'
import { useEffect, useRef, useState } from 'react'
import {
    DietChange,
    fetchDiet,
    saveRecentDiet,
} from '@/lib/store/dashboard/dietSlice'
import { mealData } from '@/app/api/diet/mealData'
import toast, { Toaster } from 'react-hot-toast'

import DietStats from './Stats/DietStats'
import { IoTrashBinSharp } from 'react-icons/io5'
import PageHeader from '@/app/components/Shell/PageHeader'

type View = 'manageDiet' | 'dietAnalysis'

const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday',
]

function formatDate(timestamp: number) {
    const d = new Date(timestamp)
    return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
}

export default function DietDashboard() {
    const userDiet = useSelector((state: RootState) => state.dietSlice.USERDIET)
    const status = useSelector((state: RootState) => state.dietSlice.STATE)
    const operation = useSelector(
        (state: RootState) => state.dietSlice.operation
    )

    const reduxOptimisticDiet = useSelector(
        (state: RootState) => state.dietSlice.optimisticDiet
    )

    const [currentView, setCurrentView] = useState<View>('manageDiet')
    const [optimisticDiet, setOptimisticDiet] = useState<DietChange[] | null>(
        null
    )
    const reversedUserDiet = optimisticDiet && [...optimisticDiet].reverse()

    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        dispatch(fetchDiet())
    }, [])

    const imagesName: string[] | undefined = reversedUserDiet?.map(
        (item) => item.name
    )
    const imageMap: { [key: string]: string } = mealData.reduce(
        (map, item) => {
            map[item.name] = item.image ?? 'default.png'
            return map
        },
        {} as { [key: string]: string }
    )

    const images = imagesName?.map((name) => imageMap[name] || 'default.png')

    const loadingToastId = useRef<string | null>(null)

    useEffect(() => {
        if (status === 'pending' && operation === 'saveDiet') {
            loadingToastId.current = toast.loading('Saving your diet')
        } else if (status === 'success' && operation === 'saveDiet') {
            if (loadingToastId.current) {
                toast.dismiss(loadingToastId.current)
            }
            toast.success('Diet saved successfully')
            setOptimisticDiet(reduxOptimisticDiet)
        }
    }, [status, operation, reduxOptimisticDiet])

    useEffect(() => {
        setOptimisticDiet(userDiet)
    }, [userDiet])

    return (
        <div className="max-w-[1500px] mx-auto">
            <Toaster position="top-center" reverseOrder={false} />

            <PageHeader
                eyebrow="Nourishment"
                title="Diet"
                description="Log your meals and trace patterns over time."
                right={
                    currentView === 'manageDiet' ? <DietAddForm /> : undefined
                }
            />

            <div className="inline-flex bg-cream-100 rounded-full p-1 mb-6 border border-ink-900/8">
                {(
                    [
                        ['manageDiet', 'Manage diet'],
                        ['dietAnalysis', 'Diet analysis'],
                    ] as const
                ).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setCurrentView(key)}
                        className={`px-5 py-1.5 rounded-full text-sm font-medium duration-300 ${
                            currentView === key
                                ? 'bg-sun-cta text-white shadow-warm'
                                : 'text-ink-700 hover:text-ink-900'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {currentView === 'manageDiet' && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {status === 'success' &&
                            reversedUserDiet?.map((data, idx) => (
                                <div
                                    key={idx}
                                    className="relative group sun-card overflow-hidden hover:-translate-y-0.5 hover:shadow-warm duration-300"
                                >
                                    <div className="flex">
                                        <div className="h-32 w-32 shrink-0 overflow-hidden">
                                            <img
                                                src={`/meals/${images && images[idx]}`}
                                                alt={data.name}
                                                className="w-full h-full object-cover group-hover:scale-105 duration-500"
                                            />
                                        </div>
                                        <div className="p-4 flex-1 min-w-0">
                                            <h3 className="font-display text-lg text-ink-900 truncate">
                                                {data.name}
                                            </h3>
                                            <div className="text-xs text-ink-700/70 mt-1">
                                                {formatDate(data.id)}
                                            </div>
                                            <div className="grid grid-cols-2 gap-1 mt-3 text-xs text-ink-700">
                                                <span>
                                                    <strong className="text-ink-900">
                                                        {data.calorie}
                                                    </strong>{' '}
                                                    kcal
                                                </span>
                                                <span>
                                                    <strong className="text-ink-900">
                                                        {data.protein}
                                                    </strong>{' '}
                                                    g protein
                                                </span>
                                                <span>
                                                    <strong className="text-ink-900">
                                                        {data.fat}
                                                    </strong>{' '}
                                                    g fat
                                                </span>
                                                <span>
                                                    <strong className="text-ink-900">
                                                        {data.carb}
                                                    </strong>{' '}
                                                    g carbs
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            dispatch(
                                                saveRecentDiet({
                                                    dietChanges: data,
                                                    method: 'remove',
                                                })
                                            )
                                        }
                                        className="absolute bottom-3 right-3 inline-flex items-center justify-center h-8 w-8 rounded-full bg-ember-500/10 text-ember-600 hover:bg-ember-500 hover:text-white duration-300"
                                        aria-label="Remove"
                                    >
                                        <IoTrashBinSharp className="text-sm" />
                                    </button>
                                </div>
                            ))}

                        {status === 'pending' &&
                            Array.from({ length: 6 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="h-32 bg-cream-200 rounded-2xl animate-pulse"
                                />
                            ))}
                    </div>

                    {(!optimisticDiet || optimisticDiet.length === 0) &&
                        status !== 'pending' && (
                            <div className="flex items-center justify-center mt-16">
                                <div className="max-w-md mx-auto p-8 sun-card text-center">
                                    <div className="font-display text-2xl text-ink-900 mb-2">
                                        No meals logged yet
                                    </div>
                                    <p className="text-ink-700/80 mb-6">
                                        Add a meal to start tracing the
                                        patterns of your day.
                                    </p>
                                    <div className="flex justify-center">
                                        <DietAddForm />
                                    </div>
                                </div>
                            </div>
                        )}
                </>
            )}

            {currentView === 'dietAnalysis' && <DietStats />}
        </div>
    )
}
