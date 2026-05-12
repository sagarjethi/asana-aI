'use client'
import { AppDispatch, RootState } from '@/lib/store'
import { setAudioState } from '@/lib/store/practice/audioSlice'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { IoVolumeMediumOutline, IoVolumeMuteOutline } from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux'

export default function Benefits() {
    const benefits = useSelector(
        (state: RootState) => state.practiceSlice.poseData?.benefits
    )
    const name = useSelector(
        (state: RootState) => state.practiceSlice.poseData?.name
    )
    const audioState = useSelector(
        (state: RootState) => state.audioSlice.audioState
    )

    const dispatch = useDispatch<AppDispatch>()

    return (
        <>
            <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-display text-xl sm:text-2xl text-ink-900 capitalize">
                        Benefits of {name}
                    </h3>
                    <button
                        type="button"
                        onClick={() =>
                            dispatch(
                                setAudioState(
                                    audioState === 'benefits' ? null : 'benefits'
                                )
                            )
                        }
                        className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-sun-cta text-white hover:opacity-90 duration-300 shadow-warm"
                        aria-label="Toggle audio"
                    >
                        {audioState === 'benefits' ? (
                            <IoVolumeMediumOutline className="text-xl" />
                        ) : (
                            <IoVolumeMuteOutline className="text-xl" />
                        )}
                    </button>
                </div>

                <ScrollArea data-lenis-prevent className="max-h-[28vh]">
                    <ul className="space-y-3">
                        {benefits?.map((text: string, idx: number) => (
                            <li
                                key={idx}
                                className="flex gap-3 text-ink-800"
                            >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-600" />
                                <span className="text-sm leading-relaxed">
                                    <strong className="font-display text-ink-900">
                                        {text.split(':')[0]}
                                    </strong>
                                    <span className="text-ink-700/80">
                                        {' '}
                                        — {text.split(':')[1]}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </div>
        </>
    )
}
