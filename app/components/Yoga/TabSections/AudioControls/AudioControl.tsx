'use client'

import { AppDispatch } from '@/lib/store'
import { setAudioState } from '@/lib/store/practice/audioSlice'
import { IoIosArrowDown } from 'react-icons/io'
import { IoVolumeMediumOutline, IoVolumeMuteOutline } from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux'
import AudioSpeed from './AudioSpeed'
import RelaxMusic from './RelaxMusic'
import VolumeSlider from './VolumeSlider'

export default function AudioControl() {
    const audioState = useSelector((state: any) => state.audioSlice.audioState)
    const dispatch = useDispatch<AppDispatch>()

    const handleAudioState = (state: 'narrator' | 'tips') => {
        if (audioState !== state) {
            dispatch(setAudioState(state))
        } else {
            dispatch(setAudioState(null))
        }
    }

    return (
        <>
            <div className="w-full flex flex-col gap-10 mt-10 sm:gap-5 sm:p-5 sm:m-5">
                <div className="w-full flex gap-10">
                    <div className="w-1/2 flex flex-col text-center gap-2">
                        <span className="font-display text-lg text-ink-900">Narrator</span>
                        <span
                            onClick={() => handleAudioState('narrator')}
                            className="inline-flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-sun-cta text-white hover:opacity-90 shadow-warm duration-300 cursor-pointer"
                        >
                            {audioState === 'narrator' ? (
                                <IoVolumeMediumOutline className="text-4xl p-1" />
                            ) : (
                                <IoVolumeMuteOutline className="text-4xl p-1" />
                            )}
                        </span>
                    </div>

                    <div className="w-1/2 flex flex-col text-center gap-2">
                        <span className="font-display text-lg text-ink-900">
                            Audio speed
                        </span>
                        <div>
                            <AudioSpeed />
                        </div>
                    </div>
                </div>

                <div className="w-full flex gap-10">
                    <div className="w-1/2 flex flex-col  text-center gap-2">
                        <span className="font-display text-lg text-ink-900">Tips</span>
                        <span
                            onClick={() => handleAudioState('tips')}
                            className="inline-flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-sun-cta text-white hover:opacity-90 shadow-warm duration-300 cursor-pointer"
                        >
                            {audioState === 'tips' ? (
                                <IoVolumeMediumOutline className="text-4xl p-1" />
                            ) : (
                                <IoVolumeMuteOutline className="text-4xl p-1" />
                            )}
                        </span>
                    </div>
                    <div className="w-1/2 flex flex-col  text-center gap-2">
                        <span className="font-display text-lg text-ink-900">
                            Ambient music
                        </span>
                        <div>
                            <RelaxMusic />
                        </div>
                    </div>
                </div>

                <div className="w-1/2 flex flex-col justify-center items-center gap-3 mx-auto sm:-mt-5">
                    <span className="font-display text-lg text-ink-900">Volume</span>
                    <div className="w-full flex justify-center items-center ">
                        <VolumeSlider />
                    </div>
                </div>
            </div>
        </>
    )
}
