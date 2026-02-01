// ============================================================================
// Settings Store - User Preferences
// ============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Settings, ThemeMode, AudioVolumes } from '../types';

interface SettingsStore {
    // State
    theme: ThemeMode;
    language: 'pt-BR' | 'en';
    audioEnabled: boolean;
    audioVolumes: AudioVolumes;
    targetScore: number;
    deadline: string | null;
    schemaVersion: number;
    termsAccepted: boolean;

    // Actions
    setTheme: (theme: ThemeMode) => void;
    setLanguage: (language: 'pt-BR' | 'en') => void;
    toggleAudio: () => void;
    setAudioVolume: (key: keyof AudioVolumes, value: number) => void;
    setTargetScore: (score: number) => void;
    setDeadline: (date: string | null) => void;
    acceptTerms: () => void;
    resetSettings: () => void;
}

const defaultAudioVolumes: AudioVolumes = {
    tick: 0,
    click: 30,
    warnings: 80,
    alarm: 100,
    celebration: 70,
};

// Sync settings to API (fire and forget)
const syncSettingsToApi = (settings: Partial<Record<string, unknown>>) => {
    import('../lib/api').then(({ saveSettings }) => {
        saveSettings(settings as any);
    }).catch(() => {
        // Silently ignore API errors
    });
};

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            // Initial state
            theme: 'light',
            language: 'pt-BR',
            audioEnabled: true,
            audioVolumes: defaultAudioVolumes,
            targetScore: 800,
            deadline: null,
            schemaVersion: 1,
            termsAccepted: false,

            // Actions
            acceptTerms: () => {
                set({ termsAccepted: true });
                syncSettingsToApi({ termsAccepted: true });
            },

            setTheme: (theme) => {
                set({ theme });

                // Apply theme to document
                const root = document.documentElement;
                if (theme === 'dark') {
                    root.classList.add('dark');
                } else if (theme === 'light') {
                    root.classList.remove('dark');
                } else {
                    // System preference
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        root.classList.add('dark');
                    } else {
                        root.classList.remove('dark');
                    }
                }
                syncSettingsToApi({ theme });
            },

            setLanguage: (language) => {
                set({ language });
                document.documentElement.lang = language === 'pt-BR' ? 'pt-BR' : 'en';
                syncSettingsToApi({ language });
            },

            toggleAudio: () => {
                set(state => {
                    const newState = { audioEnabled: !state.audioEnabled };
                    syncSettingsToApi({ audioEnabled: newState.audioEnabled });
                    return newState;
                });
            },

            setAudioVolume: (key, value) => {
                set(state => {
                    const newVolumes = {
                        ...state.audioVolumes,
                        [key]: Math.max(0, Math.min(100, value)),
                    };
                    syncSettingsToApi({ audioVolumes: newVolumes });
                    return { audioVolumes: newVolumes };
                });
            },

            setTargetScore: (score) => {
                const newScore = Math.max(100, Math.min(1000, score));
                set({ targetScore: newScore });
                syncSettingsToApi({ targetScore: newScore });
            },

            setDeadline: (date) => {
                set({ deadline: date });
                syncSettingsToApi({ deadline: date });
            },

            resetSettings: () => {
                set({
                    theme: 'light',
                    language: 'pt-BR',
                    audioEnabled: true,
                    audioVolumes: defaultAudioVolumes,
                    targetScore: 800,
                    deadline: null,
                    termsAccepted: false,
                });
                document.documentElement.classList.remove('dark');
                document.documentElement.lang = 'pt-BR';
                syncSettingsToApi({
                    theme: 'light',
                    language: 'pt-BR',
                    audioEnabled: true,
                    audioVolumes: defaultAudioVolumes,
                    targetScore: 800,
                    deadline: null,
                    termsAccepted: false,
                });
            },
        }),
        {
            name: 'ccp-settings',
            storage: createJSONStorage(() => localStorage),
            version: 1,
            onRehydrateStorage: () => (state) => {
                // Apply theme on app load
                if (state?.theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else if (state?.theme === 'system') {
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        document.documentElement.classList.add('dark');
                    }
                }
            },
        }
    )
);
