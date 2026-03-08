import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageContext';

const Counter = ({ target, label, suffix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [target]);

    return (
        <div className="text-center">
            <div className="text-5xl md:text-7xl font-black mb-2 tracking-tighter text-black">
                {count.toLocaleString()}{suffix}
            </div>
            <div className="text-[10px] md:text-sm font-black text-black/50 uppercase tracking-widest leading-tight">{label}</div>
        </div>
    );
};

const Impact = () => {
    const { t } = useLanguage();
    return (
        <section className="py-24 relative overflow-hidden bg-tricolor-gradient border-t border-black/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <Counter target={700} label={t('impact.stat1')} suffix="M+" />
                    <Counter target={22} label={t('impact.stat2')} suffix="+" />
                    <Counter target={99} label={t('impact.stat3')} suffix="%" />
                </div>

                <div className="mt-12 md:mt-20 bg-white/40 backdrop-blur-xl rounded-[2.5rem] md:rounded-[40px] p-8 md:p-12 text-center border border-black/10 relative overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h3 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter text-black">
                        {t('impact.missionTitle')} <br />
                        <span className="text-black/60">{t('impact.missionAccent')}</span>
                    </h3>
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                        <button className="px-6 md:px-10 py-4 md:py-5 rounded-full bg-black text-white font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2 text-xs md:text-base">
                            {t('impact.join')}
                        </button>
                        <button className="px-6 md:px-10 py-4 md:py-5 rounded-full bg-white/20 backdrop-blur-md border border-black/10 hover:bg-white/30 transition-colors font-black uppercase tracking-widest text-xs md:text-base text-black">
                            {t('impact.partner')}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Impact;
