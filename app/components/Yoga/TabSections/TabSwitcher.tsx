'use client'

import { BsFillCameraVideoFill, BsStars } from 'react-icons/bs'
import { TbTargetArrow } from 'react-icons/tb'
import { VscGraphLine } from 'react-icons/vsc'
import { LuSettings2 } from 'react-icons/lu'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { changeTab } from '@/lib/store/practice/practiceSlice'

import '@/app/components/Yoga/yoga.css'
export default function TabSwitcher() {
    const options = [
        {
            name: 'benefits',
            class: 'benefits',
            icon: <BsStars />,
        },
        {
            name: 'tutorial',
            class: 'tutorial',
            icon: <BsFillCameraVideoFill />,
        },
        {
            name: 'accuracy',
            class: 'accuracy',
            icon: <TbTargetArrow />,
        },
        {
            name: 'analysis',
            class: 'analysis',
            icon: <VscGraphLine />,
        },
        {
            name: 'audio control',
            class: 'audio',
            icon: <LuSettings2 />,
        },
    ]
    const currentTab = useSelector(
        (state: RootState) => state.practiceSlice.currentTab
    )
    const dispatch = useDispatch<AppDispatch>()
    return (
        <>
            <div className="flex overflow-x-auto flex-row w-full bg-cream-100 rounded-t-2xl px-3 py-2 gap-2 border-b border-ink-900/8">
                {options.map((opt, idx) => (
                    <button
                        type="button"
                        key={idx}
                        onClick={() =>
                            dispatch(
                                changeTab(
                                    opt.class.toLowerCase() as
                                        | 'benefits'
                                        | 'tutorial'
                                        | 'accuracy'
                                        | 'analysis'
                                        | 'audio'
                                )
                            )
                        }
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full duration-300 cursor-pointer
                            ${
                                currentTab === opt.class.toLowerCase()
                                    ? 'bg-sun-cta text-white shadow-warm'
                                    : 'text-ink-700 hover:text-ink-900 hover:bg-cream-200'
                            }`}
                    >
                        <span>{opt.icon}</span>
                        <span className="capitalize text-sm whitespace-nowrap font-medium">
                            {opt.name}
                        </span>
                    </button>
                ))}
            </div>
        </>
    )
}
