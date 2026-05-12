'use client'

import { poseInfo } from '@/app/api/pose/poseApiData'
import { useSearchParams } from 'next/navigation'
import { IoIosMore } from 'react-icons/io'
import { useEffect } from 'react'
import { AppDispatch, RootState } from '@/lib/store'
import { useDispatch, useSelector } from 'react-redux'
import { setPoseData } from '@/lib/store/practice/practiceSlice'
import TutorialControl from '../Utils/TutorialControl'
import { setAudioData } from '@/lib/store/practice/audioSlice'
import dynamic from 'next/dynamic'
import Menu from '../Utils/Menu/Menu'
import NewAchievements from '../NewAchievements/NewAchievements'
import PracticeLoader from '../Utils/PracticeLoader'

const UserSectionExtras = dynamic(
    () => import('@/app/components/Yoga/TabSections/Section'),
    {
        ssr: false,
        loading: () => <PracticeLoader />,
    }
)

const TensorControl = dynamic(
    () => import('@/app/components/Yoga/Utils/TensorControl'),
    {
        ssr: false,
        loading: () => <PracticeLoader />,
    }
)

const InputSource = dynamic(
    () => import('@/app/components/Yoga/VideoWebcam/InputSource'),
    {
        ssr: false,
        loading: () => <PracticeLoader />,
    }
)

export default function UserSection() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 101
    const source = searchParams.get('source') ?? 'tree.mp4'
    const data = useSelector((state: RootState) => state.practiceSlice.poseData)
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        const poseData = poseInfo.filter((pose) => pose.id === Number(id))[0]
        dispatch(setPoseData(poseData))

        dispatch(
            setAudioData({
                audioID: poseData.id,
                audioName: poseData.TFData.class,
                mainAudio: poseData.audioData.mainAudio,
                benefits: poseData.audioData.benefits,
                narratorSegment: poseData.audioData.narratorSegment,
            })
        )
    }, [id])

    return (
        <div className="max-w-[1500px] mx-auto">
            {data && (
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-[0.18em] text-sun-700 font-semibold">
                            Practice
                        </span>
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 mt-1">
                            <h1 className="font-display text-3xl sm:text-4xl text-ink-900 capitalize">
                                {data.name}
                            </h1>
                            <span className="font-display text-xl text-ink-700/70 capitalize">
                                {data.originalName}
                            </span>
                        </div>
                    </div>

                    <button
                        className="tooltip tooltip-bottom before:max-w-[60vw] inline-flex items-center gap-2 bg-cream-100 hover:bg-cream-200 border border-ink-900/8 px-4 py-2 rounded-full duration-300 cursor-pointer"
                        data-tip={data.description}
                    >
                        <IoIosMore className="text-ink-700" />
                        <span className="text-sm text-ink-700">About</span>
                    </button>
                </div>
            )}

            <div className="grid sm:grid-cols-12 gap-5">
                <div className="col-span-full sm:col-span-7 h-[55vh] sun-card overflow-hidden relative bg-ink-900">
                    <InputSource source={source} />
                </div>
                <div className="col-span-full sm:col-span-5 relative h-[55vh] sun-card overflow-hidden bg-cream-100">
                    <TutorialControl />
                </div>
            </div>

            <div className="grid sm:grid-cols-12 sm:gap-5 mt-5 gap-5">
                <div className="sm:col-span-9 min-h-[40vh] sun-card p-1">
                    <UserSectionExtras />
                </div>
                <div className="sm:col-span-3 min-h-[40vh] sun-card p-4">
                    <TensorControl></TensorControl>
                </div>
            </div>

            <div className="fixed top-5 right-5 z-30">
                <Menu />
            </div>
            <NewAchievements></NewAchievements>
        </div>
    )
}
