'use client'

import { poseInfo } from '@/app/api/pose/poseApiData'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dynamic from 'next/dynamic'

import { AppDispatch, RootState } from '@/lib/store'
import { setPoseData } from '@/lib/store/practice/practiceSlice'
import { setAudioData } from '@/lib/store/practice/audioSlice'

import ArriveOverlay from './ArriveOverlay'
import AccuracyRing from './AccuracyRing'
import ControlDock from './ControlDock'
import InfoSheet from './InfoSheet'
import Menu from '../Utils/Menu/Menu'
import NewAchievements from '../NewAchievements/NewAchievements'
import PracticeLoader from '../Utils/PracticeLoader'

// Heavy modules — only loaded after the user taps START.
const InputSource = dynamic(
    () => import('@/app/components/Yoga/VideoWebcam/InputSource'),
    { ssr: false, loading: () => <PracticeLoader /> }
)
const TutorialControl = dynamic(
    () => import('../Utils/TutorialControl'),
    { ssr: false }
)
const TensorControl = dynamic(
    () => import('../Utils/TensorControl'),
    { ssr: false, loading: () => <PracticeLoader /> }
)
const UserSectionExtras = dynamic(
    () => import('../TabSections/Section'),
    { ssr: false, loading: () => <PracticeLoader /> }
)

export default function UserSection() {
    const searchParams = useSearchParams()
    const id = Number(searchParams.get('id') ?? 101)
    const source = searchParams.get('source') ?? 'tree.mp4'
    const dispatch = useDispatch<AppDispatch>()
    const data = useSelector((s: RootState) => s.practiceSlice.poseData)

    const [phase, setPhase] = useState<'arrive' | 'practice'>('arrive')
    const [paused, setPaused] = useState(false)
    const [infoOpen, setInfoOpen] = useState(false)
    const [posesOpen, setPosesOpen] = useState(false)

    useEffect(() => {
        const pose = poseInfo.find((p) => p.id === id) ?? poseInfo[0]
        if (!pose) return
        dispatch(setPoseData(pose))
        dispatch(
            setAudioData({
                audioID: pose.id,
                audioName: pose.TFData.class,
                mainAudio: pose.audioData.mainAudio,
                benefits: pose.audioData.benefits,
                narratorSegment: pose.audioData.narratorSegment,
            })
        )
        setPhase('arrive')
        setPaused(false)
    }, [id, dispatch])

    if (phase === 'arrive') {
        return (
            <div className="max-w-[1500px] mx-auto pb-10">
                <ArriveOverlay
                    pose={
                        data
                            ? {
                                  name: data.name,
                                  originalName: data.originalName,
                                  image: data.image,
                              }
                            : null
                    }
                    onStart={() => setPhase('practice')}
                />
            </div>
        )
    }

    return (
        <div className="max-w-[1500px] mx-auto pb-24">
            {data && (
                <div className="flex items-end justify-between gap-4 mb-4 sm:mb-6">
                    <div className="flex flex-col">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-sun-700 font-semibold">
                            Hold
                        </span>
                        <h1 className="font-display text-2xl sm:text-4xl text-ink-900 capitalize leading-tight">
                            {data.name}
                        </h1>
                        <span className="font-display text-sm sm:text-lg italic text-ink-700/70 capitalize">
                            {data.originalName}
                        </span>
                    </div>
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
                <div className="lg:col-span-8 relative rounded-3xl overflow-hidden bg-ink-900 aspect-[3/4] sm:aspect-video lg:aspect-auto lg:h-[70vh] shadow-warm">
                    {!paused ? (
                        <InputSource source={source} />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-cream-50/80 text-center px-6">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-cream-50/15 flex items-center justify-center font-display text-2xl">
                                    II
                                </div>
                                <p className="font-display text-xl">
                                    Paused. Catch your breath.
                                </p>
                            </div>
                        </div>
                    )}
                    <AccuracyRing />
                    <div className="hidden sm:block">
                        <TutorialControl />
                    </div>
                </div>

                <div className="hidden lg:flex lg:col-span-4 sun-card p-4 flex-col gap-4 lg:h-[70vh] overflow-hidden">
                    <TensorControl />
                </div>
            </div>

            {/* Secondary detail panel — desktop only, deferred bundle. */}
            <div className="mt-6 hidden md:block">
                <div className="sun-card p-2 md:p-3">
                    <UserSectionExtras />
                </div>
            </div>

            <ControlDock
                paused={paused}
                onTogglePause={() => setPaused((p) => !p)}
                onOpenPoses={() => setPosesOpen(true)}
                onOpenInfo={() => setInfoOpen(true)}
            />

            <InfoSheet
                open={infoOpen}
                onClose={() => setInfoOpen(false)}
                title={data?.name ? `About ${data.name}` : 'About this pose'}
            >
                {data && (
                    <div className="flex flex-col gap-4 text-ink-800/85">
                        <img
                            src={`/pose/image/webp/${data.image}`}
                            alt={data.name}
                            className="w-full rounded-2xl bg-cream-100"
                        />
                        <p className="leading-relaxed">{data.description}</p>
                        <div className="md:hidden sun-card p-2">
                            <UserSectionExtras />
                        </div>
                    </div>
                )}
            </InfoSheet>

            <InfoSheet
                open={posesOpen}
                onClose={() => setPosesOpen(false)}
                title="Pose library"
            >
                <PoseQuickList
                    onPick={() => setPosesOpen(false)}
                    activeId={id}
                />
            </InfoSheet>

            <div className="fixed top-5 right-5 z-30">
                <Menu />
            </div>
            <NewAchievements />
        </div>
    )
}

function PoseQuickList({
    onPick,
    activeId,
}: {
    onPick: () => void
    activeId: number
}) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {poseInfo.map((p) => {
                const active = p.id === activeId
                return (
                    <a
                        key={p.id}
                        href={`/practice?id=${p.id}`}
                        onClick={onPick}
                        className={`flex flex-col gap-2 rounded-2xl border p-3 bg-cream-50 transition ${
                            active
                                ? 'border-sun-600 ring-2 ring-sun-600/30'
                                : 'border-ink-900/8 hover:border-sun-600/40'
                        }`}
                    >
                        <div className="aspect-square bg-cream-100 rounded-xl overflow-hidden flex items-center justify-center">
                            <img
                                src={`/pose/image/webp/${p.image}`}
                                alt={p.name}
                                className="w-full h-full object-contain mix-blend-multiply"
                            />
                        </div>
                        <span
                            className={`font-display capitalize ${
                                active ? 'text-sun-700' : 'text-ink-900'
                            }`}
                        >
                            {p.name}
                        </span>
                    </a>
                )
            })}
        </div>
    )
}
