import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const API_URL = 'https://p37tglqhc0.execute-api.ap-south-1.amazonaws.com/chat';

const Demo = () => {
    const { t } = useLanguage();
    const [status, setStatus] = useState('idle'); // idle, connecting, connected
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [callTimer, setCallTimer] = useState(0);
    const [sessionId, setSessionId] = useState(null);
    const [statusText, setStatusText] = useState('');
    const [isMuted, setIsMuted] = useState(false);

    const recognitionRef = useRef(null);
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
    const timerRef = useRef(null);
    const statusRef = useRef('idle');
    const isSpeakingRef = useRef(false);
    const isMutedRef = useRef(false);

    useEffect(() => { statusRef.current = status; }, [status]);
    useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
    useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) { }
            if (synthRef.current) synthRef.current.cancel();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // ===== Speech Recognition =====
    const setupRecognition = useCallback(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return null;
        const r = new SR();
        r.lang = 'hi-IN';
        r.interimResults = true;
        r.continuous = true;
        r.maxAlternatives = 1;

        r.onresult = (event) => {
            let finalText = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
            }
            if (finalText && finalText.trim()) {
                stopListening();
                processVoiceInput(finalText.trim());
            }
        };

        r.onerror = (event) => {
            if (event.error === 'no-speech') {
                setTimeout(() => {
                    if (statusRef.current === 'connected' && !isSpeakingRef.current) startListening();
                }, 1500);
            }
        };

        r.onend = () => {
            if (statusRef.current === 'connected' && !isSpeakingRef.current) {
                setTimeout(() => {
                    if (statusRef.current === 'connected' && !isSpeakingRef.current) {
                        try { r.start(); } catch (e) { }
                    }
                }, 300);
            }
        };
        return r;
    }, []);

    // ===== TTS =====
    const speakText = useCallback((text) => {
        return new Promise((resolve) => {
            if (!synthRef.current || isMutedRef.current) { resolve(); return; }
            synthRef.current.cancel();
            setIsSpeaking(true);
            const chunks = text.match(/[^।!?\.]+[।!?\.]?/g)?.filter(c => c.trim().length > 0) || [text];
            let idx = 0;
            const voices = synthRef.current.getVoices();
            const hindiVoice = voices.find(v => v.lang.includes('hi')) || voices.find(v => v.lang.includes('in'));

            function speakChunk() {
                if (idx >= chunks.length) { setIsSpeaking(false); resolve(); return; }
                const u = new SpeechSynthesisUtterance(chunks[idx].trim());
                u.lang = 'hi-IN'; u.rate = 0.95; u.pitch = 1.05;
                if (hindiVoice) u.voice = hindiVoice;
                u.onend = () => { idx++; speakChunk(); };
                u.onerror = () => { idx++; speakChunk(); };
                synthRef.current.speak(u);
            }
            speakChunk();
        });
    }, []);

    const startListening = useCallback(() => {
        if (!recognitionRef.current || statusRef.current !== 'connected') return;
        setIsListening(true);
        setStatusText('🎤 Listening... speak now');
        try { recognitionRef.current.start(); } catch (e) { }
    }, []);

    const stopListening = useCallback(() => {
        setIsListening(false);
        if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) { }
    }, []);

    const processVoiceInput = useCallback(async (text) => {
        setIsProcessing(true);
        setStatusText(`💭 Processing: "${text.length > 35 ? text.substring(0, 35) + '...' : text}"`);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, sessionId })
            });
            const data = await res.json();
            if (data.sessionId) setSessionId(data.sessionId);
            const aiText = data.response || 'Maaf kijiye, samajh nahi aaya.';
            setIsProcessing(false);
            setStatusText('🔊 Speaking...');
            await speakText(aiText);
            if (statusRef.current === 'connected') setTimeout(() => startListening(), 500);
        } catch (err) {
            setIsProcessing(false);
            setStatusText('⚠️ Network error');
            await speakText('Maaf kijiye, network problem hai. Dobara boliye.');
            if (statusRef.current === 'connected') setTimeout(() => startListening(), 500);
        }
    }, [sessionId, speakText, startListening]);

    const startCall = useCallback(async () => {
        setStatus('connecting');
        setSessionId(null);
        setCallTimer(0);
        setStatusText('Connecting...');
        timerRef.current = setInterval(() => setCallTimer(prev => prev + 1), 1000);
        recognitionRef.current = setupRecognition();
        setTimeout(async () => {
            setStatus('connected');
            setStatusText('🔊 Greeting...');
            await speakText('Namaste! BharatVani mein aapka swagat hai. Mujhse kuch bhi poochiye.');
            startListening();
        }, 1200);
    }, [setupRecognition, speakText, startListening]);

    const endCall = useCallback(() => {
        setStatus('idle');
        setIsListening(false); setIsSpeaking(false); setIsProcessing(false);
        setStatusText(''); setCallTimer(0);
        if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) { } recognitionRef.current = null; }
        if (synthRef.current) synthRef.current.cancel();
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
        if (isSpeaking && synthRef.current) { synthRef.current.cancel(); setIsSpeaking(false); }
    }, [isSpeaking]);

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const activeColor = isListening ? '#22c55e' : isSpeaking ? '#f97316' : isProcessing ? '#eab308' : '#f97316';

    return (
        <section id="demo" style={{
            padding: '80px 24px',
            background: 'linear-gradient(180deg, #0a0a0f 0%, #111118 50%, #0a0a0f 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background glow effects */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '600px', height: '600px', borderRadius: '50%',
                background: status !== 'idle'
                    ? `radial-gradient(circle, ${activeColor}08 0%, transparent 70%)`
                    : 'radial-gradient(circle, rgba(255,153,51,0.03) 0%, transparent 70%)',
                transition: 'background 1s ease', pointerEvents: 'none'
            }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Section Header */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <p style={{ color: '#FF9933', fontWeight: 800, fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>
                        LIVE DEMO
                    </p>
                    <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                        {t('demo.title')}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                        Click Start Call and just speak — no buttons needed
                    </p>
                </div>

                {/* Call Card */}
                <div style={{
                    maxWidth: '380px', margin: '0 auto',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '32px', padding: '40px 32px',
                    backdropFilter: 'blur(40px)',
                    boxShadow: status !== 'idle'
                        ? `0 0 80px ${activeColor}10, 0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`
                        : '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                    transition: 'box-shadow 0.8s ease'
                }}>
                    {/* Top label */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: status !== 'idle' ? 'rgba(34,197,94,0.1)' : 'rgba(255,153,51,0.08)',
                            border: `1px solid ${status !== 'idle' ? 'rgba(34,197,94,0.2)' : 'rgba(255,153,51,0.15)'}`,
                            padding: '5px 14px', borderRadius: '20px', marginBottom: '16px'
                        }}>
                            <div style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: status !== 'idle' ? '#22c55e' : '#FF9933',
                                boxShadow: status !== 'idle' ? '0 0 8px #22c55e' : 'none',
                                animation: status === 'connected' ? 'pulse 2s infinite' : 'none'
                            }} />
                            <span style={{
                                fontSize: '10px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
                                color: status !== 'idle' ? '#22c55e' : '#FF9933'
                            }}>
                                {status === 'idle' ? 'BHARATVANI AI' : status === 'connecting' ? 'CONNECTING' : 'LIVE'}
                            </span>
                        </div>

                        <h3 style={{
                            fontSize: '28px', fontWeight: 900, color: '#ffffff',
                            letterSpacing: '1px', marginBottom: '4px', fontFamily: 'monospace'
                        }}>
                            {t('hero.tollFree')}
                        </h3>

                        <p style={{
                            fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 700,
                            letterSpacing: '3px', textTransform: 'uppercase'
                        }}>
                            {status === 'idle' ? 'Voice AI Assistant' : formatTime(callTimer)}
                        </p>
                    </div>

                    {/* Center Circle */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', margin: '16px 0 28px' }}>
                        <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                            {/* Outer pulse rings */}
                            {status === 'connected' && (
                                <>
                                    <motion.div
                                        animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                                        style={{
                                            position: 'absolute', inset: 0, borderRadius: '50%',
                                            border: `2px solid ${activeColor}`
                                        }}
                                    />
                                    <motion.div
                                        animate={{ scale: [1, 1.45], opacity: [0.3, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                                        style={{
                                            position: 'absolute', inset: 0, borderRadius: '50%',
                                            border: `2px solid ${activeColor}`
                                        }}
                                    />
                                    <motion.div
                                        animate={{ scale: [1, 1.2], opacity: [0.2, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1 }}
                                        style={{
                                            position: 'absolute', inset: 0, borderRadius: '50%',
                                            border: `1px solid ${activeColor}`
                                        }}
                                    />
                                </>
                            )}

                            {/* Main circle */}
                            <motion.div
                                animate={status === 'connected' ? {
                                    scale: isSpeaking ? [1, 1.06, 1] : isListening ? [1, 1.04, 1] : 1,
                                } : {}}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{
                                    width: '100px', height: '100px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: status === 'idle'
                                        ? 'linear-gradient(135deg, rgba(255,153,51,0.12), rgba(19,136,8,0.08))'
                                        : `linear-gradient(135deg, ${activeColor}25, ${activeColor}08)`,
                                    border: `2px solid ${status === 'idle' ? 'rgba(255,153,51,0.2)' : activeColor + '50'}`,
                                    boxShadow: status !== 'idle' ? `0 0 40px ${activeColor}20, inset 0 0 20px ${activeColor}08` : 'none',
                                    transition: 'all 0.5s ease', position: 'relative', zIndex: 2
                                }}
                            >
                                <Phone size={36} color={status === 'idle' ? '#FF9933' : '#ffffff'} style={{
                                    filter: status !== 'idle' ? `drop-shadow(0 0 8px ${activeColor})` : 'none',
                                    animation: status === 'connecting' ? 'bounce 0.6s infinite' : 'none'
                                }} />
                            </motion.div>
                        </div>

                        {/* Waveform */}
                        <div style={{ display: 'flex', alignItems: 'end', gap: '2px', height: '32px' }}>
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        height: status === 'idle' ? 2 :
                                            isListening ? [3, Math.random() * 28 + 4, 3] :
                                                isSpeaking ? [2, Math.random() * 20 + 4, 2] :
                                                    isProcessing ? [2, 10, 2] : [2, 4, 2]
                                    }}
                                    transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.03 }}
                                    style={{
                                        width: '2.5px', borderRadius: '4px',
                                        backgroundColor: status === 'idle' ? 'rgba(255,255,255,0.08)' : activeColor,
                                        boxShadow: status !== 'idle' ? `0 0 6px ${activeColor}40` : 'none',
                                        transition: 'background-color 0.3s'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Status text */}
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={statusText || 'idle'}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 500,
                                    textAlign: 'center', minHeight: '20px', maxWidth: '260px'
                                }}
                            >
                                {status === 'idle' ? 'Tap to start a voice conversation' : statusText || '...'}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {status === 'idle' ? (
                            <button
                                onClick={startCall}
                                style={{
                                    width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    color: '#fff', fontWeight: 900, fontSize: '15px',
                                    letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                    boxShadow: '0 8px 32px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onMouseOver={e => { e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = '0 12px 40px rgba(34,197,94,0.4)'; }}
                                onMouseOut={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 8px 32px rgba(34,197,94,0.3)'; }}
                            >
                                <Phone size={20} />
                                Start Call
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={toggleMute} style={{
                                    flex: 1, padding: '16px', borderRadius: '14px', border: 'none',
                                    background: isMuted ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.04)',
                                    color: isMuted ? '#eab308' : 'rgba(255,255,255,0.6)',
                                    fontWeight: 800, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    border: `1px solid ${isMuted ? 'rgba(234,179,8,0.25)' : 'rgba(255,255,255,0.06)'}`,
                                    transition: 'all 0.2s'
                                }}>
                                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                    {isMuted ? 'Muted' : 'Speaker'}
                                </button>
                                <button onClick={endCall} style={{
                                    flex: 1, padding: '16px', borderRadius: '14px', border: 'none',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: '#fff', fontWeight: 800, fontSize: '11px', letterSpacing: '1.5px',
                                    textTransform: 'uppercase', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    boxShadow: '0 6px 24px rgba(239,68,68,0.25)', transition: 'all 0.2s'
                                }}
                                    onMouseOver={e => e.target.style.transform = 'scale(1.02)'}
                                    onMouseOut={e => e.target.style.transform = 'scale(1)'}
                                >
                                    <PhoneOff size={16} />
                                    End Call
                                </button>
                            </div>
                        )}

                        {/* Pipeline Steps */}
                        {status !== 'idle' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '4px' }}>
                                {[
                                    { label: 'ASR', active: isListening, c: '#22c55e' },
                                    { label: 'NLU', active: isProcessing, c: '#eab308' },
                                    { label: 'BEDROCK', active: isProcessing, c: '#f97316' },
                                    { label: 'TTS', active: isSpeaking, c: '#f97316' }
                                ].map((s, i) => (
                                    <div key={i} style={{ textAlign: 'center' }}>
                                        <div style={{
                                            height: '3px', borderRadius: '3px', marginBottom: '6px',
                                            background: s.active ? s.c : 'rgba(255,255,255,0.05)',
                                            boxShadow: s.active ? `0 0 10px ${s.c}` : 'none',
                                            transition: 'all 0.5s'
                                        }} />
                                        <span style={{
                                            fontSize: '8px', fontWeight: 800, letterSpacing: '1.5px',
                                            color: s.active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
                                            transition: 'color 0.5s'
                                        }}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginTop: '20px', paddingTop: '16px',
                        borderTop: '1px solid rgba(255,255,255,0.04)'
                    }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.15)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            🔒 Encrypted
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.15)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Powered by AWS
                        </span>
                    </div>
                </div>
            </div>

            {/* Keyframes */}
            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
            `}</style>
        </section>
    );
};

export default Demo;
