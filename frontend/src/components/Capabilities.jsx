import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, Wheat, ShoppingCart, Languages, ArrowRight, Grid } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Capabilities = () => {
    const { t } = useLanguage();
    const cards = [
        {
            icon: <Landmark size={28} className="text-[#FF9933]" />,
            title: t('capabilities.card1Title'),
            desc: t('capabilities.card1Desc'),
            example: t('capabilities.card1Ex'),
            color: "hover:shadow-[#FF9933]/10"
        },
        {
            icon: <Wheat size={28} className="text-[#10B981]" />,
            title: t('capabilities.card2Title'),
            desc: t('capabilities.card2Desc'),
            example: t('capabilities.card2Ex'),
            color: "hover:shadow-[#10B981]/10"
        },
        {
            icon: <ShoppingCart size={28} className="text-[#0070F3]" />,
            title: t('capabilities.card3Title'),
            desc: t('capabilities.card3Desc'),
            example: t('capabilities.card3Ex'),
            color: "hover:shadow-[#0070F3]/10"
        },
        {
            icon: <Languages size={28} className="text-[#A855F7]" />,
            title: t('capabilities.card4Title'),
            desc: t('capabilities.card4Desc'),
            example: t('capabilities.card4Ex'),
            color: "hover:shadow-[#A855F7]/10"
        }
    ];

    return (
        <section id="capabilities" className="py-32 relative overflow-hidden">
            {/* Decorative Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>



            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-20 gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-[#FF9933] font-black uppercase tracking-[0.3em] text-[10px] mb-4"
                        >
                            {t('capabilities.tag')}
                        </motion.div>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4 md:mb-6">{t('capabilities.title')} <br /><span className="text-white/60">{t('capabilities.accent')}</span></h2>
                        <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed">{t('capabilities.desc')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -15 }}
                            className={`group p-8 md:p-10 rounded-[30px] md:rounded-[40px] glass border border-white/5 flex flex-col items-start gap-6 md:gap-8 transition-all duration-500 shadow-2xl ${card.color}`}
                        >
                            <div className="p-4 md:p-5 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                                {card.icon}
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black tracking-tight">{card.title}</h3>
                                <p className="text-sm text-white/60 font-medium leading-relaxed">
                                    {card.desc}
                                </p>
                                <div className="pt-6">
                                    <div className="p-5 rounded-[24px] bg-black/40 border border-white/5 w-full group-hover:border-[#FF9933]/10 transition-colors">
                                        <p className="text-[10px] uppercase font-black text-white/40 mb-3 tracking-widest">{t('capabilities.exampleLabel')}</p>
                                        <p className="text-xs text-white/80 font-medium group-hover:text-white/100 transition-colors">"{card.example}"</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Capabilities;
