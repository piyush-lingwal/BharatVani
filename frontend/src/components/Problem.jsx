import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, WifiOff, Languages, BookOpen, Accessibility, Phone } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Problem = () => {
    const { t } = useLanguage();
    const barriers = [
        { icon: <Smartphone size={18} />, text: t('problem.barrier1') },
        { icon: <WifiOff size={18} />, text: t('problem.barrier2') },
        { icon: <BookOpen size={18} />, text: t('problem.barrier3') },
        { icon: <Languages size={18} />, text: t('problem.barrier4') },
        { icon: <Accessibility size={18} />, text: t('problem.vector') },
    ];

    return (
        <section id="problem" className="py-20 md:py-32 relative overflow-hidden bg-[#0C0C0E]">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-block px-4 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
                        >
                            {t('problem.badge')}
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 md:mb-8 leading-[1.1] tracking-tighter"
                        >
                            {t('problem.title')} <br />
                            <span className="text-white/50">{t('problem.accent')}</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-white/70 leading-relaxed mb-8 md:mb-12 max-w-xl"
                        >
                            {t('problem.desc')}
                        </motion.p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {barriers.slice(0, 4).map((barrier, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-6 rounded-3xl glass border border-white/5 flex items-start gap-4 group hover:border-[#FF9933]/30 transition-all"
                                >
                                    <div className="p-3 rounded-2xl bg-white/5 text-white/40 group-hover:bg-[#FF9933]/20 group-hover:text-[#FF9933] transition-all">
                                        {barrier.icon}
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold mb-1">{barrier.text}</div>
                                        <div className="text-xs text-white/40 uppercase font-black tracking-widest">{t('problem.vector')}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="relative space-y-8">
                        {/* Clean Comparison Visual */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* The App Barrier */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group grayscale hover:grayscale-0 transition-all"
                            >
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-red-500/50">{t('problem.current')}</div>
                                    <h4 className="text-2xl font-black tracking-tight">{t('problem.appBarrier')}</h4>
                                    <p className="text-sm text-white/40 max-w-[240px]">{t('problem.appDesc')}</p>
                                </div>
                                <div className="flex -space-x-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                                            <div className="w-6 h-1 bg-white/20 rounded-full"></div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* The BharatVani Solution */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="p-8 rounded-[2.5rem] bg-[#FF9933]/5 border border-[#FF9933]/20 flex items-center justify-between"
                            >
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#FF9933]">{t('problem.solution')}</div>
                                    <h4 className="text-2xl font-black tracking-tight">{t('problem.solutionTitle')}</h4>
                                    <p className="text-sm text-white/80 max-w-[240px]">{t('problem.solutionDesc')}</p>
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-[#FF9933] flex items-center justify-center shadow-[0_0_30px_rgba(255,153,51,0.3)]">
                                    <Phone size={32} className="text-black" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Impact Stat */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="p-8 rounded-[2.5rem] glass border border-white/5 flex items-center gap-8"
                        >
                            <div className="text-5xl font-black text-[#FF9933]">{t('problem.stat')}</div>
                            <div className="h-10 w-px bg-white/10"></div>
                            <div className="text-xs font-bold uppercase tracking-widest text-white/60 leading-relaxed">
                                {t('problem.statDesc')}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Problem;
