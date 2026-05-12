interface Props {
    title: string
    description: string
}

export default function Heading({ title, description }: Props) {
    return (
        <div className="flex flex-col mb-4 px-1">
            <h2 className="font-display text-2xl text-ink-900 capitalize">
                {title}
            </h2>
            <p className="text-sm text-ink-700/70 mt-1">{description}</p>
        </div>
    )
}
