// ============================================================================
// App Header - Floating Header with Theme and Audio Toggles
// ============================================================================

import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { AudioToggle } from './AudioToggle';

export const AppHeader: React.FC = () => {
    return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-1 bg-card/80 backdrop-blur-sm rounded-full px-2 py-1 border border-border shadow-lg">
            <AudioToggle />
            <ThemeToggle />
        </div>
    );
};
