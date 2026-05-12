'use client'

import { useState, useEffect } from 'react'

import Image from 'next/image'
import confetti from 'canvas-confetti'

import { AchievementsData } from '@/app/api/achievements/achievementsData'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { DialogClose } from '@radix-ui/react-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { Button } from '@/components/ui/button'

export default function NewAchievements() {
    const [open, setOpen] = useState<boolean>(false)
    const [filteredAchievements, setFilteredAchievements] = useState<any[]>([])

    const gender = 'men'

    const updateState = useSelector(
        (state: RootState) => state.practiceSlice.updateStatus
    )

    const isModelRunning = useSelector(
        (state: RootState) => state.tensorflowSlice.isModelRunning
    )

    useEffect(() => {
        const fetchNewAchievements = async () => {
            try {
                const response = await axios.get('/api/unlock-achievement')
                const newAchievements = response.data as number[]

                const filtered = AchievementsData.filter((achievement) =>
                    newAchievements.includes(achievement.id)
                )
                if (newAchievements.length > 0) {
                    setOpen(true)
                    setFilteredAchievements(filtered)
                }
            } catch (error) {
                console.error('Error fetching new achievements:', error)
            }
        }

        if (updateState === 'success' && !isModelRunning) {
            fetchNewAchievements()
        }
    }, [updateState, isModelRunning])

    useEffect(() => {
        if (open) {
            confetti({
                particleCount: 250,
                spread: 120,
                origin: { y: 0.5 },
                startVelocity: 25,
            })
            confetti({
                particleCount: 250,
                spread: 220,
                origin: { y: 0.6 },
            })
            confetti({
                particleCount: 300,
                spread: 150,
                origin: { y: 0.4 },
            })
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:min-w-[768px]">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl text-ink-900">
                        A new milestone, gently reached.
                    </DialogTitle>
                    <DialogDescription className="text-ink-700/80">
                        You&apos;ve unlocked new achievements. Keep returning
                        to the mat — the next one finds you naturally.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea
                    data-lenis-prevent
                    className="w-full h-[50vh] sm:h-full flex"
                >
                    <div className="flex flex-wrap gap-5 justify-center">
                        {filteredAchievements?.map((achievement) => (
                            <div
                                key={achievement.id}
                                className="sun-card p-5 flex flex-col items-center text-center relative duration-300 hover:-translate-y-0.5 hover:shadow-warm w-56"
                            >
                                <div className="rounded-full ring-2 ring-sun-600/40 overflow-hidden mb-4">
                                    <Image
                                        height={128}
                                        width={128}
                                        src={`/achievements/${achievement.icon}-${gender}.webp`}
                                        alt={achievement.name}
                                    />
                                </div>
                                <h3 className="font-display text-lg text-ink-900 mb-1">
                                    {achievement.name}
                                </h3>
                                <p className="text-xs text-ink-700/70 mb-3">
                                    {achievement.description}
                                </p>
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                        achievement.rarity === 'Legendary'
                                            ? 'bg-sun-cta text-white'
                                            : 'bg-cream-100 text-ink-700 border border-ink-900/8'
                                    }`}
                                >
                                    {achievement.rarity}
                                </span>
                                <span className="block text-xs text-ink-700/60 mt-2 capitalize">
                                    Level {achievement.level}
                                </span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <DialogClose asChild>
                    <Button
                        type="button"
                        className="bg-sun-cta text-white hover:opacity-95 border-0 rounded-full"
                    >
                        Close
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    )
}
