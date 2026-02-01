// ============================================================================
// useAudioFeedback - Play sound effects for exam interactions
// ============================================================================

import { useCallback, useRef, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

// Base64-encoded short beep sounds (very small, no external files needed)
// These are simple sine wave tones generated programmatically

export const useAudioFeedback = () => {
    const { audioEnabled, audioVolumes } = useSettingsStore();
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize AudioContext on first interaction
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    // Play a tone with given frequency and duration
    const playTone = useCallback((frequency: number, duration: number, volume: number) => {
        if (!audioEnabled || volume === 0) return;

        try {
            const ctx = getAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            // Normalize volume (0-100 to 0-0.3 for comfortable listening)
            const normalizedVolume = (volume / 100) * 0.3;
            gainNode.gain.setValueAtTime(normalizedVolume, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }, [audioEnabled, getAudioContext]);

    // Sound effects
    const playClick = useCallback(() => {
        playTone(800, 0.08, audioVolumes.click);
    }, [playTone, audioVolumes.click]);

    const playCorrect = useCallback(() => {
        // Ascending tone for correct answer
        const ctx = getAudioContext();
        if (!audioEnabled || audioVolumes.celebration === 0) return;

        try {
            const volume = (audioVolumes.celebration / 100) * 0.3;

            // Play two ascending notes
            [523, 659].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(volume, ctx.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.15);
                osc.start(ctx.currentTime + i * 0.1);
                osc.stop(ctx.currentTime + i * 0.1 + 0.15);
            });
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }, [audioEnabled, audioVolumes.celebration, getAudioContext]);

    const playIncorrect = useCallback(() => {
        // Descending tone for incorrect answer
        const ctx = getAudioContext();
        if (!audioEnabled || audioVolumes.warnings === 0) return;

        try {
            const volume = (audioVolumes.warnings / 100) * 0.3;

            // Play two descending notes
            [400, 300].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(volume, ctx.currentTime + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.2);
                osc.start(ctx.currentTime + i * 0.12);
                osc.stop(ctx.currentTime + i * 0.12 + 0.2);
            });
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }, [audioEnabled, audioVolumes.warnings, getAudioContext]);

    const playWarning = useCallback(() => {
        // Two quick beeps for time warning
        const ctx = getAudioContext();
        if (!audioEnabled || audioVolumes.warnings === 0) return;

        try {
            const volume = (audioVolumes.warnings / 100) * 0.3;

            [0, 0.2].forEach((delay) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 880;
                osc.type = 'sine';
                gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.1);
                osc.start(ctx.currentTime + delay);
                osc.stop(ctx.currentTime + delay + 0.1);
            });
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }, [audioEnabled, audioVolumes.warnings, getAudioContext]);

    const playSuccess = useCallback(() => {
        // Victory fanfare for passing exam
        const ctx = getAudioContext();
        if (!audioEnabled || audioVolumes.celebration === 0) return;

        try {
            const volume = (audioVolumes.celebration / 100) * 0.25;

            // C E G C (major chord arpeggio)
            [523, 659, 784, 1047].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(volume, ctx.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
                osc.start(ctx.currentTime + i * 0.15);
                osc.stop(ctx.currentTime + i * 0.15 + 0.3);
            });
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }, [audioEnabled, audioVolumes.celebration, getAudioContext]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return {
        playClick,
        playCorrect,
        playIncorrect,
        playWarning,
        playSuccess,
        audioEnabled,
    };
};
