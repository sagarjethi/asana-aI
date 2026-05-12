'use client'

import { useRouter } from 'next/navigation'

export default function DietTags(props: { mealTag: string }) {
    const tag = props?.mealTag

    const router = useRouter()

    const handleTagRemove = (tag: string) => {
        const currentUrl = new URL(window.location.href)
        const searchParams = new URLSearchParams(currentUrl.search)
        const overlay = searchParams.get('overlay') || null

        const tags = searchParams.get('tag')

        if (tags) {
            const tagArray = tags.split(',')
            const updatedTagArray = tagArray.filter((tagT) => tagT !== tag)
            if (updatedTagArray.length > 0) {
                searchParams.set('tag', updatedTagArray.join(','))
            } else {
                searchParams.delete('tag')
            }
        } else {
            searchParams.delete('tag')
        }

        searchParams.set('overlay', 'true')
        const newUrl = `${currentUrl.pathname}?${searchParams.toString()}`

        overlay ? router.replace(newUrl) : router.push(newUrl)
    }

    return (
        <div className="tooltip" data-tip="Click to remove">
            <button
                onClick={() => handleTagRemove(tag)}
                className="text-sm bg-sun-cta text-white px-4 py-1 capitalize rounded-full shadow-warm hover:opacity-90 duration-300"
            >
                {tag}
            </button>
        </div>
    )
}
