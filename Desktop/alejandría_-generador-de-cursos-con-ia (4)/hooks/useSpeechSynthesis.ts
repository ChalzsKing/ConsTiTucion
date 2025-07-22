
import { useState, useRef, useCallback, useEffect } from 'react';
import { synthesizeSpeech, isGeminiAvailable } from '../services/geminiService';

export const useSpeechSynthesis = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isCloudAvailable = isGeminiAvailable();
    const isBrowserAvailable = typeof window !== 'undefined' && !!window.speechSynthesis;

    const cleanup = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (isBrowserAvailable && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        setIsLoading(false);
        setIsSpeaking(false);
        setIsPaused(false);
    }, [isBrowserAvailable]);


    const speakWithBrowserApi = useCallback((text: string) => {
        if (!isBrowserAvailable) {
            setError("La síntesis de voz del navegador no está disponible.");
            return;
        }
        
        setIsLoading(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';

        utterance.onstart = () => {
            setIsLoading(false);
            setIsSpeaking(true);
            setIsPaused(false);
        };
        utterance.onpause = () => {
            setIsPaused(true);
            setIsSpeaking(true);
        };
        utterance.onresume = () => {
            setIsPaused(false);
            setIsSpeaking(true);
        };
        utterance.onend = () => {
            cleanup();
        };
        utterance.onerror = (event) => {
            if (event.error === 'interrupted' || event.error === 'canceled') {
                cleanup();
                return;
            }
            console.error("Browser speech synthesis error:", event.error);
            setError(`Error de voz del navegador: ${event.error}`);
            cleanup();
        };
        
        // This can take a moment to start, so we set loading to false in onstart
        window.speechSynthesis.speak(utterance);
    }, [isBrowserAvailable, cleanup]);


    const speak = useCallback(async (text: string) => {
        cleanup();
        setError(null);

        if (!text || !text.trim()) {
            return;
        }

        if (isCloudAvailable) {
            setIsLoading(true);
            const result = await synthesizeSpeech(text);
            setIsLoading(false);

            if (result.success && result.audioContent) {
                const audio = new Audio(`data:audio/mp3;base64,${result.audioContent}`);
                audioRef.current = audio;

                audio.onplay = () => { setIsSpeaking(true); setIsPaused(false); };
                audio.onpause = () => { if (!audio.ended) { setIsPaused(true); setIsSpeaking(true); } };
                audio.onended = () => { cleanup(); };
                audio.onerror = (e) => {
                    console.error("Error playing generated audio, falling back.", e);
                    speakWithBrowserApi(text);
                }
                try {
                    await audio.play();
                } catch (playError) {
                    console.error("Failed to play audio, falling back.", playError);
                    speakWithBrowserApi(text);
                }
            } else {
                // Silently fall back to browser API
                speakWithBrowserApi(text);
            }
        } else {
            // Fallback if Cloud is not configured
            speakWithBrowserApi(text);
        }

    }, [isCloudAvailable, cleanup, speakWithBrowserApi]);
    
    const pause = useCallback(() => {
        if (audioRef.current && !isPaused) {
            audioRef.current.pause();
        } else if (isBrowserAvailable && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
        }
    }, [isBrowserAvailable, isPaused]);
    
    const resume = useCallback(() => {
        if (audioRef.current && isPaused) {
            audioRef.current.play().catch(e => {
                console.error("Error resuming audio playback:", e);
                setError("No se pudo reanudar el audio.");
            });
        } else if (isBrowserAvailable && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    }, [isBrowserAvailable, isPaused]);

    const cancel = useCallback(() => {
        cleanup();
        setError(null);
    }, [cleanup]);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return { speak, pause, resume, cancel, isLoading, isSpeaking, isPaused, error, isAvailable: isCloudAvailable || isBrowserAvailable };
};
