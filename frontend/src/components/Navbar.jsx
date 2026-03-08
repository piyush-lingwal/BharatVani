import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const langRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        const handleClickOutside = (event) => {
            if (langRef.current && !langRef.current.contains(event.target)) {
                setIsLangOpen(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'ta', name: 'தமிழ்' },
        { code: 'te', name: 'తెలుగు' },
        { code: 'mr', name: 'मराठी' },
        { code: 'bn', name: 'বাংলা' }
    ];

    const navLinks = [
        { name: t('nav.problem'), href: "#problem" },
        { name: t('nav.capabilities'), href: "#capabilities" },
        { name: t('nav.architecture'), href: "#architecture" }
    ];

    return (
        <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 w-[95%] max-w-5xl`}>
            <div className={`glass-dark rounded-full px-6 py-3 flex justify-between items-center transition-all ${scrolled ? 'shadow-2xl border-white/10' : 'border-white/5'}`}>
                <a href="#" className="flex items-center gap-3 group cursor-pointer z-50">
                    <img src="/logo.png" alt="BharatVani Logo" className="w-14 h-auto group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-xl font-black tracking-tighter uppercase whitespace-nowrap text-white">BharatVani</span>
                </a>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-white/70">
                    {navLinks.map((link) => (
                        <a key={link.name} href={link.href} className="hover:text-[#FF9933] transition-colors">{link.name}</a>
                    ))}

                    {/* Language Switcher */}
                    <div className="relative" ref={langRef}>
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="flex items-center gap-2 hover:text-[#FF9933] transition-all px-3 py-1.5 rounded-full bg-white/5 border border-white/5 hover:border-[#FF9933]/30"
                        >
                            <Globe size={14} className="text-white/60" />
                            <span className="text-white/60">{languages.find(l => l.code === language)?.name}</span>
                            <ChevronDown size={12} className={`text-white/60 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isLangOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full mt-3 right-0 w-44 glass-dark rounded-2xl border border-white/10 p-2 overflow-hidden shadow-2xl"
                                >
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLanguage(lang.code);
                                                setIsLangOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${language === lang.code ? 'bg-[#FF9933] text-black' : 'hover:bg-white/5 text-white/70'}`}
                                        >
                                            <span className="text-xs font-bold tracking-widest">{lang.name}</span>
                                            {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <a href="#demo">
                        <button className="px-5 py-2.5 rounded-full bg-[#FF9933] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-md">
                            {t('nav.explore')}
                        </button>
                    </a>
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden z-50 p-2 text-white/60 hover:text-white transition-colors"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute top-full mt-4 left-0 w-full glass-dark rounded-[2rem] p-8 flex flex-col items-center gap-8 shadow-2xl border border-white/5 md:hidden"
                    >
                        <div className="flex flex-col items-center gap-6">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-xl font-black uppercase tracking-widest text-white hover:text-[#FF9933] transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>

                        <div className="w-full grid grid-cols-2 gap-3 pt-6 border-t border-black/5">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code);
                                        setIsOpen(false);
                                    }}
                                    className={`px-4 py-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest ${language === lang.code ? 'bg-[#FF9933] border-[#FF9933] text-black' : 'bg-white/5 border-white/5 text-white/40'}`}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>

                        <a href="#demo" onClick={() => setIsOpen(false)} className="w-full">
                            <button className="w-full px-10 py-5 rounded-2xl bg-[#FF9933] text-black font-black uppercase tracking-[0.2em] shadow-xl">
                                {t('nav.explore')}
                            </button>
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
