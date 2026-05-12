import Navbar from '@/app/components/Home/Navbar'
import Header from '@/app/components/Home/Section/Header'
import Features from '@/app/components/Home/Section/Features'
import CTA from '@/app/components/Home/Section/CTA'
import SupabasePostAuthHelper from '@/app/components/Home/SupabasePostAuthHelper'
import Footer from '@/app/components/Home/Footer'
import { Raleway } from 'next/font/google'
import './home.css'

const raleway = Raleway({ subsets: ['latin'] })

export default function Home() {
    return (
        <>
            <main className="flex h-full flex-col bg-[url('/home/bg.svg')] bg-repeat-y bg-top bg-[length:auto_100%]">
                <Navbar />

                <div
                    className={`${raleway.className} flex flex-col w-full mb-10 sm:gap-24 gap-16`}
                >
                    <div className="xl:mt-14 mt-14 sm:mt-0">
                        <Header />
                    </div>

                    <Features />

                    <CTA />
                </div>

                <Footer />
            </main>
            <SupabasePostAuthHelper />
        </>
    )
}
