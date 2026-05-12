'use client'

import { AppDispatch, RootState } from '@/lib/store'
import { setTutorial, TutorialSource } from '@/lib/store/practice/practiceSlice'
import { useDispatch, useSelector } from 'react-redux'

export default function Tutorial() {
    const tutorialSource: TutorialSource | null = useSelector(
        (state: RootState) => state.practiceSlice.tutorialSource
    )
    const poseData = useSelector(
        (state: RootState) => state.practiceSlice.poseData
    )

    const dispatch = useDispatch<AppDispatch>()
    const active = tutorialSource?.provider

    const extractVideoID = poseData?.videoData.tutorialURL.split('/').pop()

    return (
        <>
            <div className="grid sm:grid-cols-2 gap-6 w-full place-items-stretch py-2">
                {[
                    {
                        key: 'video' as const,
                        label: 'Video tutorial',
                        img: `https://img.youtube.com/vi/${extractVideoID}/0.jpg`,
                    },
                    {
                        key: 'animated' as const,
                        label: 'Animated tutorial',
                        img: `/pose/tutorial/${poseData?.tutorial}`,
                    },
                ].map((opt) => {
                    const isActive = active === opt.key
                    return (
                        <button
                            type="button"
                            key={opt.key}
                            onClick={() =>
                                dispatch(setTutorial({ provider: opt.key }))
                            }
                            className={`w-full relative flex flex-col items-stretch cursor-pointer rounded-2xl overflow-hidden duration-300 hover:-translate-y-0.5 ${
                                isActive
                                    ? 'ring-2 ring-sun-600 shadow-warm'
                                    : 'ring-1 ring-ink-900/8 hover:ring-sun-600/40'
                            }`}
                        >
                            <img
                                src={opt.img}
                                alt={opt.label}
                                className="w-full h-44 object-cover"
                            />
                            <span
                                className={`px-3 py-2 text-sm font-medium text-left ${
                                    isActive
                                        ? 'bg-sun-cta text-white'
                                        : 'bg-cream-100 text-ink-800'
                                }`}
                            >
                                {opt.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </>
    )
}
