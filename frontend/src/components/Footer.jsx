import React from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Footer = () => {
    const { t } = useLanguage();
    return (
        <footer className="py-12 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="BharatVani" className="w-12 h-auto opacity-80" />
                        <span className="text-xl font-black tracking-tighter uppercase whitespace-nowrap text-white/50">BharatVani</span>
                    </div>

                    <div className="flex gap-8 text-sm text-white/40 font-medium">
                        <a href="#" className="hover:text-[#FF9933] transition-colors">{t('footer.infra')}</a>
                        <a href="#" className="hover:text-[#FF9933] transition-colors">{t('footer.privacy')}</a>
                        <a href="#" className="hover:text-[#FF9933] transition-colors">{t('footer.compliance')}</a>
                        <a href="#" className="hover:text-[#FF9933] transition-colors">{t('footer.team')}</a>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-2.5 rounded-full border border-white/5 text-white/40 hover:text-[#FF9933] hover:border-[#FF9933]/30 transition-all cursor-pointer bg-white/5">
                            <Twitter size={18} />
                        </div>
                        <div className="p-2.5 rounded-full border border-white/5 text-white/40 hover:text-[#FF9933] hover:border-[#FF9933]/30 transition-all cursor-pointer bg-white/5">
                            <Github size={18} />
                        </div>
                        <div className="p-2.5 rounded-full border border-white/5 text-white/40 hover:text-[#FF9933] hover:border-[#FF9933]/30 transition-all cursor-pointer bg-white/5">
                            <Linkedin size={18} />
                        </div>
                    </div>
                </div>

                <div className="text-center text-[10px] font-black text-white/10 uppercase tracking-[0.2em] border-t border-white/[0.02] pt-8">
                    {t('footer.built')} — © 2026 BharatVani Platform. {t('footer.rights')}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
