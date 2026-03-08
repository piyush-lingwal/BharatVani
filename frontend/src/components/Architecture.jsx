import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, Cloud, Server, ChevronRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Architecture = () => {
    const { t } = useLanguage();
    const [activeLayer, setActiveLayer] = useState(0);

    const layers = [
        {
            title: t('architecture.l1Title'),
            icon: <Cloud size={20} />,
            desc: t('architecture.l1Desc'),
            tech: ["Amazon Connect", "Telecom Network"]
        },
        {
            title: t('architecture.l2Title'),
            icon: <Settings size={20} />,
            desc: t('architecture.l2Desc'),
            tech: ["Amazon Bedrock", "Amazon Transcribe", "Amazon Polly"]
        },
        {
            title: t('architecture.l3Title'),
            icon: <Server size={20} />,
            desc: t('architecture.l3Desc'),
            tech: ["AWS Lambda", "Service Router"]
        },
        {
            title: t('architecture.l4Title'),
            icon: <Shield size={20} />,
            desc: t('architecture.l4Desc'),
            tech: ["Amazon SNS", "Amazon DynamoDB"]
        }
    ];

    return (
        <section id="architecture" className="py-32 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF9933]/5 blur-[120px] rounded-full -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0070F3]/5 blur-[120px] rounded-full -ml-64 -mb-64"></div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm font-black uppercase tracking-[0.3em] text-[#FF9933] mb-4"
                    >
                        {t('architecture.tag')}
                    </motion.h2>
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black tracking-tight"
                    >
                        {t('architecture.title')} <br />
                        <span className="text-gradient-saffron">{t('architecture.accent')}</span>
                    </motion.h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Sidebar: Controls - Scrollable on mobile */}
                    <div className="lg:col-span-4 flex lg:flex-col gap-4 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide no-scrollbar">
                        {layers.map((layer, idx) => (
                            <motion.button
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => setActiveLayer(idx)}
                                className={`flex-shrink-0 lg:w-full text-left p-4 md:p-6 rounded-2xl transition-all duration-500 border relative overflow-hidden group ${activeLayer === idx
                                    ? 'glass border-[#FF9933]/30 bg-white/[0.05]'
                                    : 'border-white/5 hover:border-white/20'
                                    }`}
                            >
                                {activeLayer === idx && (
                                    <motion.div
                                        layoutId="activeGlow"
                                        className="absolute inset-0 bg-gradient-to-r from-[#FF9933]/10 to-transparent"
                                    />
                                )}

                                <div className="flex items-center gap-5 relative z-10">
                                    <div className={`p-3 rounded-xl transition-all duration-500 ${activeLayer === idx
                                        ? 'bg-[#FF9933] text-black scale-110 shadow-[0_0_20px_rgba(255,153,51,0.4)]'
                                        : 'bg-white/5 text-white/50 group-hover:text-white/80'
                                        }`}>
                                        {layer.icon}
                                    </div>
                                    <div>
                                        <h4 className={`text-lg font-bold transition-colors ${activeLayer === idx ? 'text-white' : 'text-white/50 group-hover:text-white/70'
                                            }`}>
                                            {layer.title}
                                        </h4>
                                        <p className={`text-xs uppercase tracking-widest mt-1 ${activeLayer === idx ? 'text-[#FF9933]/90' : 'text-white/40'
                                            }`}>
                                            {layer.tech[0]}
                                        </p>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Right: Detailed View & Visual */}
                    <div className="lg:col-span-8">
                        <div className="glass rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 border border-white/5 relative overflow-hidden h-full min-h-[450px] md:min-h-[500px] flex flex-col">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF9933]/30 to-transparent"></div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeLayer}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 flex-grow items-center"
                                >
                                    <div className="space-y-6 md:space-y-8">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9933]/10 border border-[#FF9933]/20 text-[#FF9933] text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-6">
                                                {t('architecture.layer')} 0{activeLayer + 1} {t('architecture.system')}
                                            </div>
                                            <h3 className="text-3xl md:text-4xl font-black mb-4 md:mb-6 tracking-tight">{layers[activeLayer]?.title}</h3>
                                            <p className="text-base md:text-lg text-white/80 leading-relaxed font-medium">
                                                {layers[activeLayer]?.desc}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <h5 className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-black">{t('architecture.poweredBy')}</h5>
                                            <div className="flex flex-wrap gap-2 md:gap-3">
                                                {layers[activeLayer]?.tech?.map(t => (
                                                    <div key={t} className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-white/5 border border-white/5 text-xs md:text-sm font-bold text-white/80">
                                                        {t}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Abstract Architecture Stack */}
                                    <div className="relative flex items-center justify-center py-12">
                                        <div className="relative w-64 h-80">
                                            {layers.map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{
                                                        y: (i - activeLayer) * 40,
                                                        scale: 1 - Math.abs(i - activeLayer) * 0.1,
                                                        opacity: 1 - Math.abs(i - activeLayer) * 0.3,
                                                        rotateX: 45,
                                                        rotateZ: -35
                                                    }}
                                                    className={`absolute inset-0 rounded-3xl border-2 transition-colors duration-500 shadow-2xl flex items-center justify-center ${i === activeLayer
                                                        ? 'bg-gradient-to-br from-[#FF9933]/20 to-[#FF9933]/5 border-[#FF9933] z-20'
                                                        : 'bg-white/5 border-white/10 z-10'
                                                        }`}
                                                    style={{ transformStyle: 'preserve-3d' }}
                                                >
                                                    {i === activeLayer && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="text-white transform rotateZ(35deg) rotateX(-45deg)"
                                                        >
                                                            {layers[i].icon}
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            ))}

                                            {/* Connection Lines (Abstract) */}
                                            <div className="absolute -inset-8 pointer-events-none opacity-20">
                                                <div className="w-full h-full border-2 border-dashed border-white/20 rounded-full animate-spin-slow"></div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Architecture;
