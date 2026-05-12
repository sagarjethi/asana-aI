import Navbar from '@/app/components/Home/Navbar'
import Header from '@/app/components/Home/Section/Header'
import HowItWorks from '@/app/components/Home/Section/HowItWorks'
import PoseGallery from '@/app/components/Home/Section/PoseGallery'
import Features from '@/app/components/Home/Section/Features'
import Quote from '@/app/components/Home/Section/Quote'
import CTA from '@/app/components/Home/Section/CTA'
import Footer from '@/app/components/Home/Footer'
import SupabasePostAuthHelper from '@/app/components/Home/SupabasePostAuthHelper'
import './home.css'

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
