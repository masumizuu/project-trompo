import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { AutoSliderBanner } from '@/Components/AutoSliderBanner';
import Features from '@/Components/Features';
import CTA from '@/Components/CTA';
import Footer from '@/Components/Footer';
import Header from '@/Components/Header';
import HowItWorks from '@/Components/HowItWorks';
import FAQ from '@/Components/FAQ';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    console.log('Auth user in Welcome page:', auth.user);
    
    return (
        <>
            <Head title="a business directory 📍" />
            <div className="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50">
                <div className="relative flex min-h-screen flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white">
                    <Header user={auth.user} />
                    <AutoSliderBanner />
                    <Features />
                    <HowItWorks />
                    <FAQ />
                    <CTA />
                    <Footer />
                    {/* <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                        <main className="mt-6 space-y-10">
                            
                        </main>

                        <footer className="py-16 text-center text-sm text-black dark:text-white/70">
                            Laravel v{laravelVersion} (PHP v{phpVersion})
                        </footer>
                    </div> */}
                </div>
            </div>
        </>
    );
}