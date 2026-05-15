import dynamic from 'next/dynamic'
import Navbar from '@/app/components/Home/Navbar'
import Header from '@/app/components/Home/Section/Header'
import HowItWorks from '@/app/components/Home/Section/HowItWorks'
import SupabasePostAuthHelper from '@/app/components/Home/SupabasePostAuthHelper'
import './home.css'

// Below-the-fold sections are server-rendered but their JS is split off the
// initial chunk so the landing hero paints sooner.
const PoseGallery = dynamic(
    () => import('@/app/components/Home/Section/PoseGallery'),
    { loading: () => null }
)
const Features = dynamic(
    () => import('@/app/components/Home/Section/Features'),
    { loading: () => null }
)
const Quote = dynamic(() => import('@/app/components/Home/Section/Quote'), {
    loading: () => null,
})
const CTA = dynamic(() => import('@/app/components/Home/Section/CTA'), {
    loading: () => null,
})
const Footer = dynamic(() => import('@/app/components/Home/Footer'), {
    loading: () => null,
})

export default function Home() {
    return (
        <>
            <main className="relative min-h-screen bg-cream-fade overflow-hidden">
                <Navbar />
                <Header />
                <HowItWorks />
                <PoseGallery />
                <Features />
                <Quote />
                <CTA />
                <Footer />
            </main>
            <SupabasePostAuthHelper />
        </>
    )
}
