import Link from 'next/link'
import { Raleway } from 'next/font/google'
import { IoArrowForwardOutline, IoCompassOutline } from 'react-icons/io5'
import HeaderTextAnimation from './HeaderTextAnimation'

const raleway = Raleway({ subsets: ['latin'] })

export default function Header() {
    return (
        <main className="z-10 flex xl:min-h-screen justify-center items-center w-11/12 mx-auto">
            <div className="flex flex-col gap-5 justify-center items-center">
                <HeaderTextAnimation>Welcome to AsanaAI</HeaderTextAnimation>

                <div
                    className={`${raleway.className} flex flex-col gap-3 justify-center items-center`}
                >
                    <span className="sm:text-2xl text-xl text-slate-200 text-center">
                        Your AI yoga partner — refine every pose in real time.
                    </span>
                    <span className="sm:text-xl text-base text-slate-200 xl:w-1/2 text-center">
                        Pick a pose, turn on your camera, and get instant
                        feedback powered by on-device pose estimation. No data
                        leaves your browser.
                    </span>
                </div>

                <div className="flex sm:flex-row flex-col sm:gap-10 gap-3">
                    <Link href="/practice">
                        <button className="text-lg sm:text-xl glass-card px-4 py-2 text-slate-300 cursor-pointer shadow-lg hover:shadow-blue-950 duration-300">
                            Start Practicing
                            <IoArrowForwardOutline className="inline-flex mx-1 my-auto" />
                        </button>
                    </Link>
                    <Link href="/login">
                        <button className="text-lg sm:text-xl glass-card px-4 py-2 text-slate-300 cursor-pointer shadow-lg hover:shadow-blue-950 duration-300">
                            Sign In
                            <IoCompassOutline className="inline-flex mx-1 my-auto" />
                        </button>
                    </Link>
                </div>

                <div className="relative flex opacity-80 justify-center sm:w-1/2 w-full sm:h-[25rem] h-[15rem] mt-5 rounded-2xl shadow-xl overflow-hidden">
                    <img
                        src="/home/vec.jpg"
                        alt="Yoga Practice"
                        className="w-full object-cover brightness-75"
                    />

                    <span className="absolute left-0 h-full blr" />
                    <span className="absolute right-0 h-full blr" />
                    <span className="absolute top-0 w-full blr" />
                    <span className="absolute bottom-0 w-full blr" />
                </div>
            </div>
        </main>
    )
}
