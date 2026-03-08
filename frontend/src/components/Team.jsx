import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, ExternalLink } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Team = () => {
    const { t } = useLanguage();

    const teamMembers = [
        {
            id: 1,
            name: t('team.member1Name'),
            role: t('team.member1Role'),
            bio1: t('team.member1Bio1'),
            bio2: t('team.member1Bio2'),
            email: "piyush.202304205@tulas.edu.in",
            linkedin: "https://www.linkedin.com/in/piyush-lingwal-16632b229/",
            github: "https://github.com/piyush-lingwal",
            color: "from-[#FF9933] to-[#FFB86C]",
            image: "https://api.dicebear.com/7.x/lorelei/svg?seed=Felix"
        },
        {
            id: 2,
            name: t('team.member2Name'),
            role: t('team.member2Role'),
            bio1: t('team.member2Bio1'),
            bio2: t('team.member2Bio2'),
            email: "smrithipiedy49@gmail.com",
            linkedin: "https://www.linkedin.com/in/smrithipiedy/",
            github: "https://github.com/smrithipiedy",
            color: "from-[#0070F3] to-[#50A1FF]",
            image: "https://api.dicebear.com/7.x/lorelei/svg?seed=Anya"
        },
        {
            id: 3,
            name: t('team.member3Name'),
            role: t('team.member3Role'),
            bio1: t('team.member3Bio1'),
            bio2: t('team.member3Bio2'),
            email: "vidhigarg1911@gmail.com",
            linkedin: "https://www.linkedin.com/in/vidhi-garg-b83169358/",
            github: "#",
            color: "from-[#10B981] to-[#34D399]",
            image: "https://api.dicebear.com/7.x/lorelei/svg?seed=Mia"
        },
        {
            id: 4,
            name: t('team.member4Name'),
            role: t('team.member4Role'),
            bio1: t('team.member4Bio1'),
            bio2: t('team.member4Bio2'),
            email: "snehagupta1330@gmail.com",
            linkedin: "#",
            github: "#",
            color: "from-[#A855F7] to-[#C084FC]",
            image: "https://api.dicebear.com/7.x/lorelei/svg?seed=Sasha"
        }
    ];

    return (
        <section id="team" className="py-24 relative overflow-hidden bg-black/20">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF9933]/5 blur-[120px] rounded-full -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full -z-10"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[#FF9933] font-black uppercase tracking-[0.3em] text-[10px] mb-4"
                    >
                        {t('team.tag')}
                    </motion.div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6">
                        {t('team.title')} <span className="text-white/60">{t('team.accent')}</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                        {t('team.desc')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {teamMembers.map((member, idx) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative"
                        >
                            <div className="h-full glass border border-white/5 rounded-[40px] p-8 transition-all duration-500 hover:border-white/10 hover:bg-white/[0.04] flex flex-col items-center text-center">
                                {/* Member Avatar/Icon */}
                                <div className={`relative w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br ${member.color} p-1`}>
                                    <div className="w-full h-full rounded-[20px] bg-[#0F0F12] flex items-center justify-center overflow-hidden">
                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-black border border-white/10 text-white/40 shadow-xl group-hover:text-[#FF9933] transition-colors">
                                        <ExternalLink size={12} />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-1 text-white group-hover:text-[#FF9933] transition-colors">{member.name}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#FF9933]/60 mb-6">{member.role}</p>

                                <div className="space-y-4 flex-1">
                                    <p className="text-[13px] text-white/60 leading-relaxed font-medium">
                                        {member.bio1}
                                    </p>
                                    <p className="text-[13px] text-white/60 leading-relaxed font-medium">
                                        {member.bio2}
                                    </p>
                                </div>

                                {/* Social Links */}
                                <div className="pt-8 flex gap-3">
                                    <motion.a
                                        whileHover={{ y: -3 }}
                                        href={`mailto:${member.email}`}
                                        className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all text-white/40 hover:text-white"
                                        title="Email"
                                    >
                                        <Mail size={18} />
                                    </motion.a>
                                    <motion.a
                                        whileHover={{ y: -3 }}
                                        href={member.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all ${member.linkedin === '#' ? 'pointer-events-none opacity-20' : 'text-white/40 hover:text-white'}`}
                                        title="LinkedIn"
                                    >
                                        <Linkedin size={18} />
                                    </motion.a>
                                    <motion.a
                                        whileHover={{ y: -3 }}
                                        href={member.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all ${member.github === '#' ? 'pointer-events-none opacity-20' : 'text-white/40 hover:text-white'}`}
                                        title="GitHub"
                                    >
                                        <Github size={18} />
                                    </motion.a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;
