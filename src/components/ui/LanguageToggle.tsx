// ============================================================================
// Language Toggle Component - Flag Flip Animation
// ============================================================================

import React from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { cn } from '../../lib/utils';

// Brazil Flag SVG
const BrazilFlag: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 32 24" className={className} aria-label="Bandeira do Brasil">
        <rect width="32" height="24" fill="#009c3b" />
        <polygon points="16,3 30,12 16,21 2,12" fill="#ffdf00" />
        <circle cx="16" cy="12" r="5" fill="#002776" />
        <path
            d="M11,12 Q16,9 21,12"
            fill="none"
            stroke="#fff"
            strokeWidth="1"
        />
    </svg>
);

// UK Flag SVG
const UKFlag: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 32 24" className={className} aria-label="UK Flag">
        <rect width="32" height="24" fill="#012169" />
        <path d="M0,0 L32,24 M32,0 L0,24" stroke="#fff" strokeWidth="4" />
        <path d="M0,0 L32,24 M32,0 L0,24" stroke="#C8102E" strokeWidth="2" />
        <path d="M16,0 V24 M0,12 H32" stroke="#fff" strokeWidth="6" />
        <path d="M16,0 V24 M0,12 H32" stroke="#C8102E" strokeWidth="3" />
    </svg>
);

export const LanguageToggle: React.FC = () => {
    const language = useSettingsStore((state) => state.language);
    const setLanguage = useSettingsStore((state) => state.setLanguage);

    const isPtBR = language === 'pt-BR';

    const handleToggle = () => {
        setLanguage(isPtBR ? 'en' : 'pt-BR');
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
                'overflow-hidden',
                'perspective-1000'
            )}
            aria-label={isPtBR ? 'Switch to English' : 'Mudar para Português'}
            style={{ perspective: '1000px' }}
        >
            <div
                className={cn(
                    'relative w-6 h-4 transition-transform duration-500',
                    'transform-style-3d'
                )}
                style={{
                    transformStyle: 'preserve-3d',
                    transform: isPtBR ? 'rotateY(0deg)' : 'rotateY(180deg)',
                }}
            >
                {/* Brazil Flag (Front) */}
                <div
                    className="absolute inset-0 backface-hidden rounded-sm overflow-hidden shadow-sm"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <BrazilFlag className="w-full h-full" />
                </div>
                {/* UK Flag (Back) */}
                <div
                    className="absolute inset-0 backface-hidden rounded-sm overflow-hidden shadow-sm"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    <UKFlag className="w-full h-full" />
                </div>
            </div>
        </button>
    );
};
