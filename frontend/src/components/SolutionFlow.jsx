import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Cpu, Database, MessageSquare, ArrowRight, Zap, Shield, Globe, Box } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const SolutionFlow = () => {
    const { t } = useLanguage();

    const steps = [
        {
            icon: <Phone size={32} />,
            title: t('pipeline.step1'),
            desc: t('pipeline.step1Desc'),
            color: "#FF9933",
            accent: t('pipeline.accent1')
        },
        {
            icon: <Cpu size={32} />,
            title: t('pipeline.step2'),
            desc: t('pipeline.step2Desc'),
            color: "#6366f1",
            accent: t('pipeline.accent2')
        },
        {
            icon: <Database size={32} />,
            title: t('pipeline.step3'),
            desc: t('pipeline.step3Desc'),
            color: "#128807",
            accent: t('pipeline.accent3')
        },
        {
            icon: <MessageSquare size={32} />,
            title: t('pipeline.step4'),
            desc: t('pipeline.step4Desc'),
            color: "#64748b",
            accent: t('pipeline.accent4')
        },
    ];

    return (
        <section id="operational-pipeline" className="py-20 md:py-32 relative bg-tricolor-gradient overflow-hidden">
            {/* Decorative Ambient Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#FF9933]/5 blur-[120px] rounded-full animate-drift" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#128807]/5 blur-[120px] rounded-full animate-drift" style={{ animationDelay: '-7s' }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col mb-12 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-black/5 w-fit mb-8 self-center lg:self-start shadow-sm"
                    >
                        <Zap size={14} className="text-[#FF9933]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/60">
                            {t('pipeline.tag')}
                        </span>
                    </motion.div>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 text-center lg:text-left">
                        <div className="space-y-4">
                            <motion.h3
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-black leading-[0.9]"
                            >
                                {t('pipeline.heading')} <br />
                                <span className="text-black/30 italic">{t('pipeline.headingAccent')}</span>
                            </motion.h3>
                        </div>

                        <motion.p
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="max-w-md text-black/70 leading-relaxed font-medium text-base md:text-lg lg:text-right"
                        >
                            {t('pipeline.description')}
                        </motion.p>
                    </div>
                </div>

                {/* The Pipeline Visualization */}
                <div className="relative pt-10 md:pt-20 pb-12">
                    {/* Background Flow Path (Desktop Only) */}
                    <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 hidden lg:block overflow-visible pr-12">
                        <svg width="100%" height="200" viewBox="0 0 1200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                            <motion.path
                                d="M 0 100 C 150 100, 150 100, 300 100 C 450 100, 450 100, 600 100 C 750 100, 750 100, 900 100 C 1050 100, 1050 100, 1200 100"
                                stroke="rgba(0,0,0,0.05)"
                                strokeWidth="2"
                                strokeDasharray="8 12"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />
                            {/* Animated Pulse */}
                            <motion.circle
                                r="4"
                                fill="#FF9933"
                                initial={{ offsetDistance: "0%" }}
                                animate={{ offsetDistance: "100%" }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                style={{
                                    offsetPath: "path('M 0 100 C 150 100, 150 100, 300 100 C 450 100, 450 100, 600 100 C 750 100, 750 100, 900 100 C 1050 100, 1050 100, 1200 100')"
                                }}
                                className="filter blur-[1px]"
                            />
                        </svg>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15, duration: 0.6 }}
                                className="group relative"
                            >
                                {/* Card Body */}
                                <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 h-full shadow-[0_8px_48px_rgba(0,0,0,0.03)] hover:shadow-[0_32px_64px_rgba(0,0,0,0.08)] transition-all duration-700 md:group-hover:-translate-y-3 relative overflow-hidden flex flex-col">
                                    {/* Inner Color Glow */}
                                    <div
                                        className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-1000 pointer-events-none"
                                        style={{ backgroundColor: step.color }}
                                    />

                                    <div className="relative z-10 flex flex-col h-full space-y-10">
                                        {/* Icon Container */}
                                        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-0">
                                            <div
                                                className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                                                style={{
                                                    background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}CC 100%)`,
                                                    boxShadow: `0 12px 24px -8px ${step.color}66`
                                                }}
                                            >
                                                {step.icon}
                                                {/* Ripple Effect */}
                                                <div className="absolute inset-0 rounded-[1.5rem] animate-ping bg-current opacity-10 group-hover:opacity-20" />
                                            </div>

                                            <span className="text-4xl md:text-5xl font-black text-black/5 select-none leading-none group-hover:text-black/10 transition-colors duration-500">
                                                0{idx + 1}
                                            </span>
                                        </div>

                                        <div className="space-y-4 flex-1 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-2">
                                                <motion.div
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: step.color }}
                                                />
                                                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-black/40">
                                                    {step.accent}
                                                </span>
                                            </div>
                                            <h4 className="text-2xl font-black text-black leading-tight group-hover:text-gradient-saffron transition-all duration-500">
                                                {step.title}
                                            </h4>
                                            <p className="text-sm text-black/60 font-medium leading-relaxed">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Line */}
                                    <div
                                        className="absolute bottom-0 left-0 h-1.5 bg-current opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-full mx-10 mb-8"
                                        style={{ width: "calc(100% - 80px)", color: step.color }}
                                    />
                                </div>

                                {/* Connector Arrow (Desktop Only) */}
                                {idx < steps.length - 1 && (
                                    <div className="hidden lg:flex absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white border border-black/5 shadow-xl group-hover:scale-110 transition-transform duration-500">
                                        <ArrowRight size={18} className="text-black/20 group-hover:text-[#FF9933] group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Technical Highlight - Redesigned for Maximum Impact */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 md:mt-32 relative group"
                >
                    <div className="absolute inset-0 bg-black rounded-[2.5rem] md:rounded-[4rem] group-hover:scale-[1.01] transition-transform duration-700 -rotate-1 opacity-[0.03]" />

                    <div className="relative p-8 md:p-12 lg:p-20 rounded-[2.5rem] md:rounded-[4rem] lg:rounded-[4.5rem] bg-white border border-black/[0.03] shadow-[0_32px_80px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                        {/* Huge Decorative Background Icon */}
                        <div className="absolute -bottom-24 -right-24 opacity-[0.015] group-hover:opacity-[0.03] transition-all duration-1000 group-hover:scale-110 group-hover:-rotate-12 pointer-events-none">
                            <Cpu size={500} strokeWidth={0.5} />
                        </div>

                        <div className="flex-1 text-center lg:text-left relative z-10 space-y-10">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-black/[0.03] backdrop-blur-sm">
                                <Shield size={16} className="text-[#128807]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">
                                    {t('pipeline.latency')}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-black/20" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#128807]">{t('pipeline.enterprise')}</span>
                            </div>

                            <h5 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 md:mb-8 text-black leading-[1.1] tracking-tighter">
                                {t('pipeline.infiniteScale')} <br />
                                <span className="text-gradient-saffron italic">{t('pipeline.neuralSpeed')}</span>
                            </h5>

                            <blockquote className="relative p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-black/[0.02] border-l-8 border-[#FF9933]">
                                <p className="text-lg md:text-xl text-black/70 leading-relaxed font-semibold italic">
                                    "{t('pipeline.quote')}"
                                </p>
                            </blockquote>
                        </div>

                        <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-6 relative z-10">
                            {[
                                { label: t('pipeline.avgResponse'), val: "800ms", sub: t('pipeline.latencyGuarantee'), color: "#FF9933" },
                                { label: t('pipeline.uptime'), val: "99.9%", sub: t('pipeline.slaAvailability'), color: "#128807" }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 10 }}
                                    className="group/stat bg-white border border-black/[0.05] p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 text-center sm:text-left min-w-full sm:min-w-[280px]"
                                >
                                    <div className="text-[10px] uppercase font-black tracking-[0.25em] text-black/30 mb-2 md:mb-4 group-hover/stat:text-[#FF9933] transition-colors">
                                        {stat.label}
                                    </div>
                                    <div className="text-5xl md:text-6xl font-black mb-2 md:mb-3 tracking-tighter" style={{ color: stat.color }}>
                                        {stat.val}
                                    </div>
                                    <div className="text-[10px] md:text-[11px] font-black text-black/40 flex items-center justify-center sm:justify-start gap-2 uppercase tracking-widest">
                                        <Zap size={10} className="text-current opacity-40" />
                                        {stat.sub}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Certification/Trust Marks */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-24 flex flex-wrap justify-center gap-10 items-center opacity-30 grayscale hover:grayscale-0 transition-all duration-1000 pointer-events-none"
                >
                    <div className="flex items-center gap-3 font-black text-[10px] tracking-[0.3em] text-black uppercase">
                        <Globe size={18} /> {t('pipeline.cloudBackbone')}
                    </div>
                    <div className="hidden sm:block w-px h-6 bg-black/10" />
                    <div className="flex items-center gap-3 font-black text-[10px] tracking-[0.3em] text-black uppercase">
                        <Shield size={18} /> {t('pipeline.encryption')}
                    </div>
                    <div className="hidden sm:block w-px h-6 bg-black/10" />
                    <div className="flex items-center gap-3 font-black text-[10px] tracking-[0.3em] text-black uppercase">
                        <Zap size={18} /> {t('pipeline.fastProcessing')}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SolutionFlow;
