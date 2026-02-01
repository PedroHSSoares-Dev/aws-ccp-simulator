// ============================================================================
// Theme Toggle Component - Sun/Moon Animation
// ============================================================================

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { cn } from '../../lib/utils';

export const ThemeToggle: React.FC = () => {
    const theme = useSettingsStore((state) => state.theme);
    const setTheme = useSettingsStore((state) => state.setTheme);

    const isDark = theme === 'dark';

    const handleToggle = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    return (
        <button
            onClick={handleToggle}
            className={cn(
                'relative w-10 h-10 rounded-full',
                'bg-card border border-border',
                'flex items-center justify-center',
                'hover:bg-card-hover transition-all duration-300',
                'focus:outline-none focus:ring-2 focus:ring-aws-orange/50',
                'overflow-hidden'
            )}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Sun Icon */}
            <Sun
                className={cn(
                    'absolute w-5 h-5 text-amber-500 transition-all duration-500',
                    isDark
                        ? 'opacity-0 rotate-90 scale-0'
                        : 'opacity-100 rotate-0 scale-100'
                )}
            />
            {/* Moon Icon */}
            <Moon
                className={cn(
                    'absolute w-5 h-5 text-indigo-400 transition-all duration-500',
                    isDark
                        ? 'opacity-100 rotate-0 scale-100'
                        : 'opacity-0 -rotate-90 scale-0'
                )}
            />
        </button>
    );
};
