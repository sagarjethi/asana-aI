import { FcBinoculars } from 'react-icons/fc'

export default function DietSearchNoResult() {
    return (
        <div className="flex flex-col items-center justify-center py-16 sun-card px-10 w-full max-w-md">
            <FcBinoculars className="text-6xl mb-4" />
            <p className="font-display text-xl text-ink-900">
                Nothing matched
            </p>
            <p className="mt-2 text-sm text-ink-700/70 text-center">
                Try a different search or remove some filters.
            </p>
        </div>
    )
}
