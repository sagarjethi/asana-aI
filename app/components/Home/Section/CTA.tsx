import Link from 'next/link'
import { IoArrowForwardOutline } from 'react-icons/io5'

export default function CTA() {
    return (
        <section className="w-11/12 mx-auto py-10">
            <div className="glass-card rounded-3xl p-10 text-center flex flex-col items-center gap-5">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
                    Ready to roll out your mat?
                </h2>
                <p className="text-slate-300 max-w-xl">
                    Open your camera, choose a pose, and let AsanaAI guide you
                    through your first session.
                </p>
                <Link href="/practice">
                    <button className="text-lg sm:text-xl glass-card px-6 py-3 text-slate-100 cursor-pointer shadow-lg hover:shadow-blue-950 duration-300">
                        Start your first session
                        <IoArrowForwardOutline className="inline-flex mx-2" />
                    </button>
                </Link>
            </div>
        </section>
    )
}
