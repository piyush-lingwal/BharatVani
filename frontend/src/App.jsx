import React, { Suspense, lazy } from 'react';

// Eagerly load above-the-fold components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Scene from './components/Scene';

// Lazy-load everything below the fold
const Problem = lazy(() => import('./components/Problem'));
const SolutionFlow = lazy(() => import('./components/SolutionFlow'));
const Capabilities = lazy(() => import('./components/Capabilities'));
const Architecture = lazy(() => import('./components/Architecture'));
const Demo = lazy(() => import('./components/Demo'));
const Team = lazy(() => import('./components/Team'));
const Impact = lazy(() => import('./components/Impact'));
const Footer = lazy(() => import('./components/Footer'));

// Lightweight loading placeholder
function SectionFallback() {
    return (
        <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-[#FF9933]/40 border-t-[#FF9933] rounded-full animate-spin" />
        </div>
    );
}

function App() {
    return (
        <div className="bg-[#0E0E11] text-white min-h-screen selection:bg-[#FF9933]/30 selection:text-[#FF9933] relative overflow-hidden">
            {/* Global Background Blobs */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-[#FF9933]/5 blur-[120px] rounded-full animate-drift"></div>
                <div className="absolute top-[60%] right-[10%] w-[500px] h-[500px] bg-[#0070F3]/5 blur-[150px] rounded-full animate-drift" style={{ animationDelay: '-5s' }}></div>
                <div className="absolute bottom-[10%] left-[30%] w-[450px] h-[450px] bg-[#10B981]/5 blur-[130px] rounded-full animate-drift" style={{ animationDelay: '-10s' }}></div>
            </div>

            <Scene />
            <Navbar />

            <main>
                <Hero />
                <Suspense fallback={<SectionFallback />}>
                    <div id="problem"><Problem /></div>
                    <SolutionFlow />
                    <div id="capabilities"><Capabilities /></div>
                    <div id="architecture"><Architecture /></div>
                    <div id="demo"><Demo /></div>
                    <Team />
                    <Impact />
                </Suspense>
            </main>

            <Suspense fallback={null}>
                <Footer />
            </Suspense>
        </div>
    );
}

export default App;
