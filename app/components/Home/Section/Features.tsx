import {
    IoAccessibilityOutline,
    IoSparklesOutline,
    IoLockClosedOutline,
} from 'react-icons/io5'

const features = [
    {
        icon: <IoAccessibilityOutline className="text-4xl" />,
        title: 'Real-time pose feedback',
        body: 'On-device pose estimation watches your form and corrects you frame by frame — no lag, no upload.',
    },
    {
        icon: <IoSparklesOutline className="text-4xl" />,
        title: 'Guided practice library',
        body: 'A curated catalogue of asanas, from beginner to advanced, each with audio cues and visual references.',
    },
    {
        icon: <IoLockClosedOutline className="text-4xl" />,
        title: 'Private by default',
        body: 'Your webcam stream is analyzed entirely in your browser. Nothing is recorded, nothing leaves your device.',
    },
]

export default function Features() {
    return (
        <section className="w-11/12 mx-auto py-10">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-3">
                    Practice with intention
                </h2>
                <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                    AsanaAI gives you a quiet, focused space to refine your
                    practice — backed by computer vision that respects your
                    privacy.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((f) => (
                    <div
                        key={f.title}
                        className="glass-card p-6 rounded-2xl text-slate-100 flex flex-col gap-3"
                    >
                        <div className="text-sky-300">{f.icon}</div>
                        <h3 className="text-xl font-semibold">{f.title}</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {f.body}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    )
}
