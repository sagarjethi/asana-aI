import * as React from 'react'

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'
import Link from 'next/link'

export default function RecentActivity(recentActivities: any) {
    return (
        <Carousel
            opts={{
                align: 'start',
            }}
            className="w-[92%] mx-auto"
        >
            <CarouselContent>
                {recentActivities &&
                    recentActivities.recentActivities?.map(
                        (item: any, idx: number) => (
                            <CarouselItem key={idx} className="sm:basis-1/3">
                                <Link href={`/practice?id=${item.id}`}>
                                    <div className="m-2 group rounded-2xl border border-ink-900/8 bg-cream-50 overflow-hidden hover:shadow-warm hover:-translate-y-0.5 duration-300 cursor-pointer">
                                        <div className="w-full flex justify-center bg-cream-100 p-5">
                                            <img
                                                src={`/pose/image/webp/${item?.image}`}
                                                alt={item.name}
                                                className="h-28 object-contain mix-blend-multiply group-hover:scale-105 duration-500"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1 text-center px-4 py-3 border-t border-ink-900/6">
                                            <span className="capitalize font-display text-base text-ink-900 line-clamp-1">
                                                {item.name}
                                            </span>
                                            <span className="capitalize text-xs text-ink-700/60 line-clamp-1">
                                                {item.originalName}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </CarouselItem>
                        )
                    )}
            </CarouselContent>
            <CarouselPrevious className="border-ink-900/10 text-ink-800 hover:bg-cream-100" />
            <CarouselNext className="border-ink-900/10 text-ink-800 hover:bg-cream-100" />
        </Carousel>
    )
}
