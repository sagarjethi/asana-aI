'use client'
import React from 'react'
import { Radar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    RadialLinearScale,
    ArcElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js'
import { pose } from '@/app/api/pose/poseApiData'

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend, Filler)

export default function PerformanceAOI({ areaOfInterest }) {
    const backgroundColor = [
        'rgba(247, 127, 0, 0.3)',
        'rgba(252, 191, 73, 0.3)',
        'rgba(255, 107, 53, 0.3)',
        'rgba(92, 138, 96, 0.3)',
    ]

    const borderColor = [
        'rgba(247, 127, 0, 1)',
        'rgba(252, 191, 73, 1)',
        'rgba(255, 107, 53, 1)',
        'rgba(92, 138, 96, 1)',
    ]

    const FAreaOfInterest = areaOfInterest.slice(0, 5)
    const label = FAreaOfInterest.map((item) => pose[parseInt(item.id)])
    const accuracy = FAreaOfInterest.map((item) => {
        const sum = item.data.reduce((sum, a) => sum + a, 0)
        return Math.round(sum / item.data.length)
    })

    const inaccuracy = accuracy.map((item) => 100 - item)

    const data = {
        labels: label,
        datasets: [
            {
                label: 'Accuracy',
                data: accuracy,
                backgroundColor: backgroundColor[0],
                borderColor: borderColor[0],
                borderWidth: 1,
                fill: true,
            },
            {
                label: 'Inaccuracy',
                data: inaccuracy,
                backgroundColor: 'rgba(92, 138, 96, 0.25)',
                borderColor: 'rgba(92, 138, 96, 1)',
                borderWidth: 1,
                fill: true,
            },
        ],
    }

    const options = {
        scale: {
            angleLines: {
                display: true,
            },
            ticks: {
                suggestedMin: 0,
                suggestedMax: 100,
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    }

    return (
        <>
            <div className="xl:h-11/12 xl:w-11/12 h-full w-full">
                <Radar data={data} options={options} />
            </div>
        </>
    )
}
