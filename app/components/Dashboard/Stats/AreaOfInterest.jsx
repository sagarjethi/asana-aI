// src/PolarChart.js
'use client'
import React from 'react'
import { PolarArea } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    RadialLinearScale,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js'
import { pose } from '@/app/api/pose/poseApiData'

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend)

export default function AreaOfInterest({ areaOfInterest }) {
    const FAreaOfInterest = areaOfInterest.slice(0, 5)
    const label = FAreaOfInterest.map((item) => pose[parseInt(item.id)])
    const count = FAreaOfInterest.map((item) => item.count)

    const data = {
        labels: label,
        datasets: [
            {
                label: 'I have performed',
                data: count,
                backgroundColor: [
                    'rgba(247, 127, 0, 0.45)',
                    'rgba(252, 191, 73, 0.55)',
                    'rgba(255, 107, 53, 0.4)',
                    'rgba(92, 138, 96, 0.4)',
                    'rgba(226, 88, 34, 0.45)',
                ],
                borderColor: [
                    'rgba(247, 127, 0, 1)',
                    'rgba(252, 191, 73, 1)',
                    'rgba(255, 107, 53, 1)',
                    'rgba(92, 138, 96, 1)',
                    'rgba(226, 88, 34, 1)',
                ],
                borderWidth: 1,
            },
        ],
    }
    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const dataset = context.dataset.data
                        const label = context.label
                        const value = dataset[context.dataIndex]
                        return `I had performed ${label} : ${value} times`
                    },
                },
            },
        },
        scales: {
            r: {
                pointLabels: {
                    display: true,
                    centerPointLabels: true,
                    font: {
                        size: 18,
                    },
                },
            },
        },

        responsive: true,
        maintainAspectRatio: false,
    }

    return (
        <div className="xl:h-11/12 w-11/12 h-full sm:w-full">
            <PolarArea data={data} options={options} />
        </div>
    )
}
