import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Globe, Wifi, Battery, Mic, MicOff, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const PhoneScreen = ({ type }) => {
    const { t } = useLanguage();

    return (
        <div className="w-full h-full flex flex-col bg-[#0F0F12] text-white">
            {/* Status Bar */}
            <div className="p-2 flex justify-between items-center opacity-40">
                <div className="text-[8px] font-bold">12:00</div>
                <div className="flex gap-1 items-center">
                    <Wifi size={8} />
                    <Battery size={8} />
                </div>
            </div>

            {/* Call UI */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 overflow-hidden p-3 shadow-2xl">
                    <img src="/logo.png" alt="Logo" className="w-full h-auto drop-shadow-[0_0_12px_rgba(255,153,51,0.6)]" />
                </div>
                <div className="text-[16px] font-black uppercase tracking-widest text-[#FF9933] mb-1">BharatVani</div>
                <div className="text-[10px] opacity-60 mb-4 tracking-tight">{t('hero.tollFree')}</div>

                {/* Voice Waves */}
                <div className="flex gap-0.5 items-center h-4 mb-4">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ height: ['20%', '100%', '20%'] }}
                            transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
                            className="w-[1.5px] bg-[#FF9933] rounded-full"
                        />
                    ))}
                </div>

                <div className="text-[8px] font-medium text-center px-4 opacity-80 leading-tight">
                    {t('demo.userQuery')}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="p-4 flex justify-around items-center opacity-40 border-t border-white/5">
                <Mic size={10} />
                <MicOff size={10} />
                <MoreHorizontal size={10} />
            </div>
        </div>
    );
};

const Hero = () => {
    const { t, language } = useLanguage();

    const taglines = {
        en: [
            { t1: "India's Toll-Free", t2: "AI Assistant" },
            { t1: "The Internet,", t2: "Spoken." },
            { t1: "Voice Powered", t2: "Digital Access" },
            { t1: "Zero Barriers.", t2: "Just Voice." },
        ],
        hi: [
            { t1: "भारत की टोल-फ्री", t2: "AI सहायक" },
            { t1: "इंटरनेट,", t2: "आवाज़ में।" },
            { t1: "वॉयस पावर्ड", t2: "डिजिटल पहुंच" },
            { t1: "शून्य बाधाएं।", t2: "सिर्फ आवाज़।" },
        ],
        ta: [
            { t1: "இந்தியாவின் இலவச", t2: "AI உதவியாளர்" },
            { t1: "இணையம்,", t2: "பேசுகிறது." },
            { t1: "குரல் வழி", t2: "டிஜிட்டல் அணுகல்" },
            { t1: "தடைகள் இல்லை.", t2: "குரல் மட்டுமே." },
        ],
        mr: [
            { t1: "भारताची टोल-फ्री", t2: "AI सहाय्यक" },
            { t1: "इंटरनेट,", t2: "आवाजामध्ये." },
            { t1: "व्हॉइस पॉवर्ड", t2: "डिजिटल प्रवेश" },
            { t1: "शून्य अडथळे.", t2: "फक्त आवाज." },
        ],
        te: [
            { t1: "భారతదేశపు టోల్-ఫ్రీ", t2: "AI అసిస్టెంట్" },
            { t1: "ఇంటర్నెట్,", t2: "మాట్లాడుతుంది." },
            { t1: "వాయిస్ పవర్డ్", t2: "డిజిటల్ యాక్సెస్" },
            { t1: "అడ్డంకులు లేవు.", t2: "కేవలం వాయిస్." },
        ],
        bn: [
            { t1: "ভারতের টোল-ফ্রি", t2: "AI অ্যাসিস্ট্যান্ট" },
            { t1: "ইন্টারনেট,", t2: "কথায়।" },
            { t1: "ভয়েস পাওয়ার্ড", t2: "ডিজিটাল অ্যাক্সেস" },
            { t1: "শূন্য বাধা।", t2: "শুধুমাত্র ভয়েস।" },
        ]
    };

    const currentLanguage = language || 'en';
    const currentTaglines = taglines[currentLanguage] || taglines['en'];
    const [taglineIndex, setTaglineIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTaglineIndex((prev) => (prev + 1) % currentTaglines.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [currentTaglines.length]);

    return (
        <section className="relative min-h-[95vh] flex flex-col items-center pt-32 pb-20 overflow-hidden bg-tricolor-gradient">
            <div className="max-w-4xl mx-auto px-6 relative z-10 text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/10 border border-black/10 text-[10px] font-bold text-black/70 mb-8 tracking-widest uppercase"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9933] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF9933]"></span>
                    </span>
                    {t('hero.badge')}
                </motion.div>



                <div className="h-[180px] sm:h-[220px] md:h-[280px] flex items-center justify-center relative w-full mb-8 perspective-1000">
                    <AnimatePresence mode="wait">
                        <motion.h1
                            key={`${language}-${taglineIndex}`}
                            initial={{ opacity: 0, rotateX: -20, y: 20 }}
                            animate={{ opacity: 1, rotateX: 0, y: 0 }}
                            exit={{ opacity: 0, rotateX: 20, y: -20 }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[min(10vw,2.8rem)] sm:text-5xl md:text-[7.5rem] leading-[1.1] md:leading-[1.0] tracking-tighter w-full absolute inset-0 flex flex-col items-center justify-center text-center origin-center px-4"
                        >
                            <span className="hero-heading block text-black whitespace-nowrap">{currentTaglines[taglineIndex].t1}</span>
                            <span className="hero-heading-italic block text-[#FF9933] whitespace-nowrap">{currentTaglines[taglineIndex].t2}</span>
                        </motion.h1>
                    </AnimatePresence>
                </div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-lg md:text-xl text-black/70 leading-relaxed hero-body max-w-2xl mx-auto font-medium"
                >
                    {t('hero.description')}
                </motion.p>

                {/* Interactive Toll-Free Number CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="mt-10"
                >
                    <a href="tel:0018127923339" className="group relative inline-flex flex-col items-center">
                        {/* Glass card container */}
                        <div className="relative px-8 md:px-12 py-5 md:py-6 rounded-[2rem] bg-black/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-500 group-hover:shadow-[0_20px_80px_rgba(255,153,51,0.3)] group-hover:border-[#FF9933]/30">
                            {/* Animated gradient border glow */}
                            <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="absolute inset-[-1px] rounded-[2rem] bg-gradient-to-r from-[#FF9933] via-white/20 to-[#138808] blur-[1px]"></div>
                                <div className="absolute inset-[1px] rounded-[2rem] bg-black/90"></div>
                            </div>

                            <div className="relative z-10 flex items-center gap-4 md:gap-6">
                                {/* Pulsing phone icon */}
                                <div className="relative">
                                    <motion.div
                                        animate={{ scale: [1, 1.15, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute inset-0 rounded-2xl bg-[#FF9933]/20 blur-lg"
                                    ></motion.div>
                                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-[#FF9933] to-[#FF6600] flex items-center justify-center shadow-[0_8px_24px_rgba(255,153,51,0.4)]">
                                        <motion.div
                                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                                        >
                                            <Phone size={22} className="text-white" />
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Number with digit animation */}
                                <div className="flex flex-col items-start">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FF9933] mb-1">
                                        Toll-Free • 24/7
                                    </span>
                                    <div className="flex items-center">
                                        {'0018127923339'.split('').map((digit, i) => (
                                            <motion.span
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.8 + i * 0.06, duration: 0.4, ease: "easeOut" }}
                                                className="text-2xl md:text-3xl font-black text-white tracking-wider tabular-nums group-hover:text-[#FF9933] transition-colors duration-300"
                                                style={{ transitionDelay: `${i * 30}ms` }}
                                            >
                                                {digit}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>

                                {/* Arrow / CTA indicator */}
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="hidden md:flex w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center group-hover:bg-[#FF9933]/20 group-hover:border-[#FF9933]/30 transition-all duration-300"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white/50 group-hover:text-[#FF9933] transition-colors">
                                        <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </motion.div>
                            </div>
                        </div>

                        {/* "Call Now" label below */}
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-black/40 group-hover:text-[#FF9933] transition-colors"
                        >
                            Call Now — It's Free
                        </motion.span>
                    </a>
                </motion.div>
            </div>

            {/* 3-Phone Graphic: Feature Phone, Old Smartphone, iPhone 17 Pro */}
            <div className="relative w-full max-w-5xl mx-auto h-[550px] md:h-[650px] flex items-center justify-center">

                {/* 1. Feature Phone (Button Phone) - Left & Deep */}
                <motion.div
                    initial={{ opacity: 0, x: -100, rotateY: 20, z: -50 }}
                    animate={{ opacity: 1, x: -215, y: 60, rotateY: 15, rotateX: 5, z: 0 }}
                    transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                    className="absolute z-10 w-[180px] h-[340px] bg-[#222226] rounded-[2rem] border-[4px] border-[#3A3A3E] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden hidden md:block"
                >
                    <div className="w-full h-full flex flex-col pt-4 px-3 pb-6">
                        {/* Speaker Grille */}
                        <div className="flex justify-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-1 h-1 rounded-full bg-white/10"></div>
                            ))}
                        </div>

                        {/* Screen */}
                        <div className="h-[170px] bg-[#0F0F12] rounded-lg overflow-hidden border border-white/10 shadow-inner">
                            <PhoneScreen type="feature" />
                        </div>

                        {/* Navigation Ring (D-pad) */}
                        <div className="mt-4 flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-4 bg-[#FF4444]/20 rounded-md border border-[#FF4444]/30"></div> {/* End Key */}
                                <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center relative">
                                    <div className="w-4 h-4 rounded-full bg-white/10"></div>
                                </div>
                                <div className="w-8 h-4 bg-[#44FF44]/20 rounded-md border border-[#44FF44]/30"></div> {/* Call Key */}
                            </div>

                            {/* Keypad */}
                            <div className="grid grid-cols-3 gap-1.5 w-full mt-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num, i) => (
                                    <div key={i} className="h-7 bg-white/5 rounded-md border border-white/5 flex flex-col items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <span className="text-[10px] font-bold text-white/60">{num}</span>
                                        <span className="text-[5px] text-white/20 uppercase font-black">
                                            {num === 2 ? 'abc' : num === 3 ? 'def' : num === 4 ? 'ghi' : num === 5 ? 'jkl' : num === 6 ? 'mno' : num === 7 ? 'pqrs' : num === 8 ? 'tuv' : num === 9 ? 'wxyz' : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Early Stage Smartphone - Right & Mid */}
                <motion.div
                    initial={{ opacity: 0, x: 100, rotateY: -20, z: -20 }}
                    animate={{ opacity: 1, x: 200, y: -40, rotateY: -25, rotateX: 5, z: 0 }}
                    transition={{ delay: 0.7, duration: 1.2, ease: "easeOut" }}
                    className="absolute z-20 w-[240px] h-[480px] bg-[#1A1A1E] rounded-[2.5rem] border-[6px] border-[#2A2A2E] shadow-2xl overflow-hidden hidden md:block"
                >
                    <div className="w-full h-full flex flex-col p-4">
                        {/* Top Bezel */}
                        <div className="flex justify-between items-center mb-4 px-4 opacity-40">
                            <div className="w-2 h-2 rounded-full bg-[#2A2A2E]"></div>
                            <div className="w-8 h-1 bg-[#2A2A2E] rounded-full"></div>
                        </div>

                        <div className="flex-1 rounded-[1.5rem] overflow-hidden border border-white/10 bg-black relative">
                            {/* Camera cutout */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-black/40 rounded-full z-10 transition-all"></div>
                            <PhoneScreen type="android" />
                        </div>

                        {/* Home Button/Chin */}
                        <div className="mt-4 flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 shadow-inner"></div>
                            <div className="text-[6px] font-bold text-white/10 uppercase tracking-widest">{t('hero.globalConnect')}</div>
                        </div>
                    </div>
                </motion.div>

                {/* 3. iPhone 17 Pro - Center & Front */}
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.8 }}
                    animate={{ opacity: 1, y: -20, scale: 1 }}
                    transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                    className="relative z-30 w-[280px] h-[580px] bg-black rounded-[4rem] border-[2px] border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.4)] overflow-hidden"
                >
                    {/* Metal Frame Inner Glow */}
                    <div className="absolute inset-0 rounded-[4rem] border-[10px] border-[#1A1A1E] z-10 pointer-events-none"></div>

                    {/* Screen Content */}
                    <div className="w-full h-full relative p-2">
                        {/* Dynamic Island */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-[100] flex items-center justify-around px-2 border border-white/5">
                            <div className="w-1 h-1 rounded-full bg-blue-500/50"></div>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-1.5 h-1.5 rounded-full bg-[#FF9933]"
                            ></motion.div>
                        </div>

                        <div className="w-full h-full rounded-[3.2rem] overflow-hidden border-[1px] border-white/10 shadow-inner relative">
                            {/* Side buttons */}
                            <div className="absolute -left-1 top-32 w-1 h-12 bg-white/10 rounded-r-md"></div>
                            <div className="absolute -left-1 top-48 w-1 h-20 bg-white/10 rounded-r-md"></div>
                            <div className="absolute -right-1 top-40 w-1 h-24 bg-white/10 rounded-l-md"></div>

                            <PhoneScreen type="iphone" />
                        </div>
                    </div>
                </motion.div>

                {/* Floating Information Components */}
                {/* 1. Language Bubble */}
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10%] left-[5%] md:left-[15%] glass-dark border border-white/10 p-4 rounded-3xl flex items-center gap-4 shadow-2xl z-40"
                >
                    <div className="w-10 h-10 rounded-2xl bg-[#FF9933]/20 flex items-center justify-center">
                        <Globe size={20} className="text-[#FF9933]" />
                    </div>
                    <div className="text-left">
                        <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-0.5">{t('hero.bubbleLanguages')}</div>
                        <div className="text-sm font-bold text-white">{t('hero.bubbleLangCount')}</div>
                    </div>
                </motion.div>

                {/* 2. Latency Bubble */}
                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[20%] right-[0%] md:right-[15%] glass-dark border border-white/10 p-4 rounded-3xl flex items-center gap-4 shadow-2xl z-40"
                >
                    <div className="w-10 h-10 rounded-2xl bg-[#128807]/20 flex items-center justify-center">
                        <Mic size={20} className="text-[#128807]" />
                    </div>
                    <div className="text-left">
                        <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-0.5">{t('hero.bubbleLatency')}</div>
                        <div className="text-sm font-bold text-white">{t('hero.bubbleLatencyVal')}</div>
                    </div>
                </motion.div>

                {/* 3. Coverage Bubble */}
                <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[40%] right-[3%] md:right-[3%] glass-dark border border-white/10 p-4 rounded-3xl flex items-center gap-4 shadow-2xl z-40 hidden md:flex"
                >
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                        <Wifi size={20} className="text-blue-500" />
                    </div>
                    <div className="text-left">
                        <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-0.5">{t('hero.bubbleAccess')}</div>
                        <div className="text-sm font-bold text-white">{t('hero.bubbleAccessVal')}</div>
                    </div>
                </motion.div>

                {/* 4. Pillars Bubble - LEFT */}
                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    className="absolute top-[50%] left-[2%] md:left-[3%] glass-dark border border-white/10 p-4 rounded-3xl items-center gap-4 shadow-2xl z-40 hidden md:flex"
                >
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                        <Battery size={20} className="text-purple-500" />
                    </div>
                    <div className="text-left">
                        <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-0.5">{t('hero.bubblePillar')}</div>
                        <div className="text-sm font-bold text-white">{t('capabilities.card1Title')}</div>
                    </div>
                </motion.div>

                {/* 5. Population Bubble - LEFT */}
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-[20%] left-[4%] md:left-[6%] glass-dark border border-white/10 p-4 rounded-3xl items-center gap-4 shadow-2xl z-40 hidden md:flex"
                >
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                        <Globe size={20} className="text-orange-500" />
                    </div>
                    <div className="text-left">
                        <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-0.5">{t('hero.bubbleCoverage')}</div>
                        <div className="text-sm font-bold text-white">{t('hero.bubbleCoverageVal')}</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
