// ============================================================================
// AudioToggle - Toggle button for audio settings
// ============================================================================

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { cn } from '../../lib/utils';

export const AudioToggle: React.FC = () => {
    const { audioEnabled, toggleAudio } = useSettingsStore();

    return (
        <button
            onClick={toggleAudio}
            className={cn(
                'relative p-2 rounded-full transition-all duration-300',
                'hover:bg-card-hover focus:outline-none focus:ring-2 focus:ring-aws-orange/50',
                audioEnabled ? 'text-text-primary' : 'text-text-secondary'
            )}
            aria-label={audioEnabled ? 'Desativar áudio' : 'Ativar áudio'}
            title={audioEnabled ? 'Áudio ativado' : 'Áudio desativado'}
        >
            <div className="relative w-5 h-5">
                {/* Volume icon with animation */}
                <div
                    className={cn(
                        'absolute inset-0 transition-all duration-300',
                        audioEnabled ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    )}
                >
                    <Volume2 className="w-5 h-5" />
                </div>
                <div
                    className={cn(
                        'absolute inset-0 transition-all duration-300',
                        !audioEnabled ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    )}
                >
                    <VolumeX className="w-5 h-5" />
                </div>
            </div>
        </button>
    );
};
