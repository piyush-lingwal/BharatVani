import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Play, MessageSquare, Volume2, Send } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const API_URL = 'https://p37tglqhc0.execute-api.ap-south-1.amazonaws.com/chat';

const Demo = () => {
    const { t } = useLanguage();
    const [status, setStatus] = useState('idle'); // idle, connecting, connected
    const [transcript, setTranscript] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [callTimer, setCallTimer] = useState(0);
    const [sessionId, setSessionId] = useState(null);

    const scrollRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
    const timerRef = useRef(null);
    const lastResponseRef = useRef('');

    // Auto-scroll transcript
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) { }
            if (synthRef.current) synthRef.current.cancel();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const addTranscript = useCallback((speaker, text) => {
        setTranscript(prev => [...prev, {
            speaker,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    }, []);

    // ===== Speech Recognition Setup =====
    const setupRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return null;

        const r = new SpeechRecognition();
        r.lang = 'hi-IN';
        r.interimResults = true;
        r.continuous = true;
        r.maxAlternatives = 1;

        r.onresult = (event) => {
            let finalText = '';
            let interimText = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalText += event.results[i][0].transcript;
                } else {
                    interimText += event.results[i][0].transcript;
                }
            }
            if (finalText && finalText.trim()) {
                stopListening();
                processVoiceInput(finalText.trim());
            }
        };

        r.onerror = (event) => {
            console.warn('Speech error:', event.error);
            if (event.error === 'no-speech') {
                setTimeout(() => { if (status === 'connected' && !isSpeaking) startListening(); }, 2000);
            }
        };

        r.onend = () => {
            if (isListening) {
                try { r.start(); } catch (e) { }
            }
        };

        return r;
    }, [status, isSpeaking, isListening]);

    // ===== Text-to-Speech (chunked for long responses) =====
    const speakText = useCallback((text) => {
        return new Promise((resolve) => {
            if (!synthRef.current) { resolve(); return; }
            synthRef.current.cancel();
            setIsSpeaking(true);

            const chunks = text.match(/[^।!?\.]+[।!?\.]?/g)?.filter(c => c.trim().length > 0) || [text];
            let idx = 0;

            const voices = synthRef.current.getVoices();
            const hindiVoice = voices.find(v => v.lang.includes('hi')) || voices.find(v => v.lang.includes('in'));

            function speakChunk() {
                if (idx >= chunks.length) {
                    setIsSpeaking(false);
                    resolve();
                    return;
                }
                const utterance = new SpeechSynthesisUtterance(chunks[idx].trim());
                utterance.lang = 'hi-IN';
                utterance.rate = 0.92;
                utterance.pitch = 1.05;
                if (hindiVoice) utterance.voice = hindiVoice;
                utterance.onend = () => { idx++; speakChunk(); };
                utterance.onerror = () => { idx++; speakChunk(); };
                synthRef.current.speak(utterance);
            }
            speakChunk();
        });
    }, []);

    // ===== Call Flow =====
    const startCall = useCallback(async () => {
        setStatus('connecting');
        setTranscript([]);
        setSessionId(null);
        setCallTimer(0);

        // Start timer
        timerRef.current = setInterval(() => {
            setCallTimer(prev => prev + 1);
        }, 1000);

        recognitionRef.current = setupRecognition();

        setTimeout(async () => {
            setStatus('connected');
            addTranscript('system', 'Call connected...');
            await speakText('Namaste! BharatVani mein aapka swagat hai. Mujhse kuch bhi poochiye, main sun rahi hoon.');
            startListening();
        }, 1500);
    }, [setupRecognition, addTranscript, speakText]);

    const endCall = useCallback(() => {
        setStatus('idle');
        setIsListening(false);
        setIsSpeaking(false);
        setIsProcessing(false);
        if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) { } recognitionRef.current = null; }
        if (synthRef.current) synthRef.current.cancel();
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        addTranscript('system', 'Call ended');
    }, [addTranscript]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current || status !== 'connected') return;
        setIsListening(true);
        try { recognitionRef.current.start(); } catch (e) { }
    }, [status]);

    const stopListening = useCallback(() => {
        setIsListening(false);
        if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) { } }
    }, []);

    const toggleMic = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            if (isSpeaking && synthRef.current) { synthRef.current.cancel(); setIsSpeaking(false); }
            startListening();
        }
    }, [isListening, isSpeaking, startListening, stopListening]);

    // ===== Process Voice/Text Input =====
    const processVoiceInput = useCallback(async (text) => {
        addTranscript('user', text);
        setIsProcessing(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, sessionId })
            });

            const data = await response.json();
            if (data.sessionId) setSessionId(data.sessionId);

            const aiText = data.response || 'Maaf kijiye, samajh nahi aaya.';
            lastResponseRef.current = aiText;
            addTranscript('ai', aiText);
            setIsProcessing(false);

            await speakText(aiText);

            // Auto-start listening after speaking
            if (status === 'connected') {
                setTimeout(() => startListening(), 500);
            }
        } catch (err) {
            console.error('API error:', err);
            const errText = 'Maaf kijiye, network problem hai. Dobara try karein.';
            addTranscript('ai', errText);
            setIsProcessing(false);
            await speakText(errText);
            if (status === 'connected') setTimeout(() => startListening(), 500);
        }
    }, [sessionId, addTranscript, speakText, status, startListening]);

    // ===== Text Input Submit =====
    const handleTextSubmit = useCallback((e) => {
        e.preventDefault();
        if (!textInput.trim() || status !== 'connected') return;
        stopListening();
        processVoiceInput(textInput.trim());
        setTextInput('');
    }, [textInput, status, processVoiceInput, stopListening]);

    const replayLast = useCallback(() => {
        if (lastResponseRef.current && !isSpeaking) {
            speakText(lastResponseRef.current);
        }
    }, [isSpeaking, speakText]);

    const formatTime = (s) => {
        const m = String(Math.floor(s / 60)).padStart(2, '0');
        const sec = String(s % 60).padStart(2, '0');
        return `${m}:${sec}`;
    };

    // Check if browser supports speech recognition
    const hasSpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

    return (
        <section id="demo" className="py-24 bg-tricolor-gradient">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black mb-1 text-black/60 tracking-tight">{t('demo.title')}</h2>
                    <h3 className="text-3xl font-black tracking-tight text-black">{t('demo.subtitle')}</h3>
                    <p className="text-black/50 mt-3 text-sm max-w-xl mx-auto">Talk to BharatVani live — ask about government schemes, farming advice, weather, or anything!</p>
                </div>

                <div className="max-w-4xl mx-auto glass rounded-[2.5rem] md:rounded-[40px] border border-white/10 overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-2xl">
                    {/* Phone Screen */}
                    <div className="md:col-span-5 bg-[#1A1A1E] p-6 md:p-10 flex flex-col items-center justify-between min-h-[450px] md:min-h-[600px] border-b md:border-b-0 md:border-r border-white/5">
                        <div className="text-center w-full">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 mx-auto mb-6 flex items-center justify-center relative overflow-hidden group">
                                <div className={`absolute inset-0 ${status !== 'idle' ? 'bg-gradient-to-br from-[#FF9933]/40 to-[#138808]/40 animate-pulse' : 'bg-gradient-to-br from-[#FF9933]/20 to-[#FFCC33]/20 opacity-50'}`}></div>
                                <Phone size={32} className={`text-[#FF9933] relative z-10 ${status !== 'idle' ? 'animate-bounce' : 'group-hover:scale-110'} transition-transform`} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[#FF9933] font-black tracking-[0.2em] text-[10px] uppercase">
                                    {status === 'idle' ? t('demo.verified') : status === 'connecting' ? 'CONNECTING...' : 'LIVE SESSION'}
                                </p>
                                <h4 className="text-3xl font-black tracking-tight">{t('hero.tollFree')}</h4>
                                <p className="text-white/50 text-xs font-bold uppercase tracking-widest">{t('demo.access')}</p>
                                {status === 'connected' && (
                                    <p className="text-[#FF9933] text-sm font-mono mt-2">{formatTime(callTimer)}</p>
                                )}
                            </div>
                        </div>

                        {/* Interactive Waveform */}
                        <div className="w-full space-y-8">
                            <div className="flex justify-center items-end gap-1.5 h-16">
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            height: status === 'idle' ? 4 :
                                                isListening ? [8, Math.random() * 50 + 10, 8] :
                                                    isSpeaking ? [6, Math.random() * 35 + 8, 6] :
                                                        isProcessing ? [4, 20, 4] : [4, 8, 4]
                                        }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05 }}
                                        className={`w-1.5 rounded-full shadow-[0_0_10px_rgba(255,153,51,0.3)] ${isListening ? 'bg-green-400' :
                                                isSpeaking ? 'bg-[#FF9933]' :
                                                    isProcessing ? 'bg-yellow-400' : 'bg-[#FF9933]'
                                            }`}
                                    />
                                ))}
                            </div>

                            <div className="flex justify-center gap-3">
                                {status === 'idle' ? (
                                    <button
                                        onClick={startCall}
                                        className="group relative px-8 py-4 rounded-2xl bg-green-500 text-black font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-[0_20px_40px_rgba(34,197,94,0.3)]"
                                    >
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                                        <Play size={18} fill="black" />
                                        {t('demo.initiate')}
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={endCall}
                                            className="px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all text-sm"
                                        >
                                            <PhoneOff size={16} />
                                            {t('demo.end')}
                                        </button>
                                        {hasSpeechRecognition && (
                                            <button
                                                onClick={toggleMic}
                                                className={`px-6 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 transition-all text-sm ${isListening
                                                        ? 'bg-green-500 text-black shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-pulse'
                                                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                                                    }`}
                                            >
                                                {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                                                {isListening ? '🎤 Listening' : 'Mic'}
                                            </button>
                                        )}
                                        {lastResponseRef.current && (
                                            <button
                                                onClick={replayLast}
                                                className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                                                title="Replay last response"
                                            >
                                                <Volume2 size={16} />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="w-full flex justify-between items-center px-4 opacity-30 text-[10px] font-black uppercase tracking-[0.2em]">
                            <span>{t('demo.encrypted')}</span>
                            <span className={`${status !== 'idle' ? 'text-green-400 opacity-100' : ''}`}>
                                {isListening ? '🎤 Sun rahi hoon...' :
                                    isSpeaking ? '🔊 Bol rahi hoon...' :
                                        isProcessing ? '💭 Soch rahi hoon...' :
                                            t('demo.voiceOnly')}
                            </span>
                        </div>
                    </div>

                    {/* Transcript & Input Panel */}
                    <div className="md:col-span-7 p-6 md:p-10 flex flex-col bg-black/90 backdrop-blur-3xl shadow-2xl">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                            <div>
                                <h5 className="font-black text-xl tracking-tight mb-1">{t('demo.processor')}</h5>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${status === 'idle' ? 'bg-white/10' : 'bg-green-500 animate-pulse'}`}></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                                        {status === 'idle' ? t('demo.statusIdle') :
                                            isListening ? '🎤 Listening...' :
                                                isSpeaking ? '🔊 Speaking...' :
                                                    isProcessing ? '💭 Processing...' :
                                                        t('demo.statusStream')}
                                    </span>
                                </div>
                            </div>
                            <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${status !== 'idle'
                                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                    : 'bg-[#FF9933]/10 border border-[#FF9933]/20 text-[#FF9933]'
                                }`}>
                                {status !== 'idle' ? '● LIVE' : t('demo.stable')}
                            </div>
                        </div>

                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto space-y-4 pr-4 no-scrollbar max-h-[350px] scroll-smooth"
                        >
                            {transcript.length === 0 && status === 'idle' && (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-16 h-16 rounded-full border border-dashed border-white/10 flex items-center justify-center mb-6 opacity-40">
                                        <MessageSquare size={24} className="text-white" />
                                    </div>
                                    <h6 className="text-white/60 font-black uppercase tracking-widest text-[10px]">{t('demo.ready')}</h6>
                                    <p className="text-white/40 text-xs mt-2">
                                        {hasSpeechRecognition
                                            ? 'Click "Initiate Call" to start a live voice session with BharatVani AI'
                                            : 'Click "Initiate Call" and type your questions to chat with BharatVani AI'}
                                    </p>
                                </div>
                            )}

                            <AnimatePresence initial={false}>
                                {transcript.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex flex-col ${item.speaker === 'system' ? 'items-center' :
                                                item.speaker === 'user' ? 'items-end' : 'items-start'
                                            }`}
                                    >
                                        {item.speaker === 'system' ? (
                                            <div className="text-[9px] text-white/30 font-mono py-2">— {item.text} —</div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-3 mb-1 px-1">
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${item.speaker === 'ai' ? 'text-[#FF9933]' : 'text-blue-400'
                                                        }`}>
                                                        {item.speaker === 'ai' ? '🤖 BharatVani' : '👤 You'}
                                                    </span>
                                                    <span className="text-[9px] text-white/10 tabular-nums">{item.time}</span>
                                                </div>
                                                <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed max-w-[90%] font-medium ${item.speaker === 'ai'
                                                        ? 'bg-white/[0.03] border border-white/5 text-white/90'
                                                        : 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                                                    }`}>
                                                    {item.text}
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isProcessing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-start"
                                >
                                    <div className="p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-[#FF9933] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-[#FF9933] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-[#FF9933] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Text Input (always available when connected) */}
                        {status === 'connected' && (
                            <form onSubmit={handleTextSubmit} className="mt-4 pt-4 border-t border-white/5">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Type your question here... (Hindi or English)"
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#FF9933]/50 transition-colors"
                                        disabled={isProcessing}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!textInput.trim() || isProcessing}
                                        className="px-4 py-3 rounded-xl bg-[#FF9933] text-black font-bold hover:bg-[#FF9933]/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Status Steps */}
                        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-4 gap-4">
                            {[
                                { label: 'ASR', active: isListening },
                                { label: 'NLU', active: isProcessing },
                                { label: 'Bedrock', active: isProcessing },
                                { label: 'TTS', active: isSpeaking }
                            ].map((step, i) => (
                                <div key={i} className="space-y-2">
                                    <div className={`h-1 rounded-full transition-all duration-700 ${step.active ? 'bg-[#FF9933] shadow-[0_0_10px_#FF9933]' : 'bg-white/10'}`}></div>
                                    <div className={`text-[8px] font-black uppercase tracking-widest text-center ${step.active ? 'text-white' : 'text-white/40'}`}>{step.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Demo;
