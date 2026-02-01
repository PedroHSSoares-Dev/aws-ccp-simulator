import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    FlagOff,
    CheckCircle
} from 'lucide-react';

interface NavigationProps {
    currentIndex: number;
    totalQuestions: number;
    isMarked: boolean;
    isAnswered: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onToggleMark: () => void;
    onFinish: () => void;
    isLastQuestion: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
    currentIndex,
    totalQuestions,
    isMarked,
    isAnswered,
    onPrevious,
    onNext,
    onToggleMark,
    onFinish,
    isLastQuestion,
}) => {
    const isFirstQuestion = currentIndex === 0;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border">
            {/* Left section: Previous button */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    onClick={onPrevious}
                    disabled={isFirstQuestion}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                    aria-label="Questão anterior"
                >
                    Anterior
                </Button>

                {/* Question counter */}
                <span className="text-sm text-text-secondary hidden sm:inline">
                    Questão{' '}
                    <span className="font-semibold text-text-primary">
                        {currentIndex + 1}
                    </span>{' '}
                    de {totalQuestions}
                </span>
            </div>

            {/* Center section: Mark for review */}
            <Button
                variant={isMarked ? 'outline' : 'ghost'}
                onClick={onToggleMark}
                leftIcon={isMarked ? <FlagOff className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
                className={cn(
                    isMarked && 'border-warning text-warning hover:bg-warning/10'
                )}
                aria-pressed={isMarked}
            >
                {isMarked ? 'Desmarcar' : 'Marcar para Revisão'}
            </Button>

            {/* Right section: Next/Finish button */}
            <div className="flex items-center gap-3">
                {/* Mobile question counter */}
                <span className="text-sm text-text-secondary sm:hidden">
                    {currentIndex + 1}/{totalQuestions}
                </span>

                {isLastQuestion ? (
                    <Button
                        variant="primary"
                        onClick={onFinish}
                        rightIcon={<CheckCircle className="w-4 h-4" />}
                    >
                        Finalizar
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onClick={onNext}
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                        Próxima
                    </Button>
                )}
            </div>
        </div>
    );
};

// Keyboard shortcut hint component
interface ShortcutsHintProps {
    visible?: boolean;
}

export const ShortcutsHint: React.FC<ShortcutsHintProps> = ({
    visible = true
}) => {
    if (!visible) return null;

    const shortcuts = [
        { key: '1-4', label: 'Selecionar' },
        { key: 'W/S', label: 'Opções' },
        { key: '←/→', label: 'Questões' },
        { key: 'M', label: 'Marcar' },
        { key: 'F', label: 'Finalizar' },
    ];

    return (
        <div className="hidden lg:flex items-center gap-4 text-xs text-text-secondary">
            <span className="font-medium">Atalhos:</span>
            {shortcuts.map(({ key, label }) => (
                <span key={key} className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-card rounded border border-border font-mono">
                        {key}
                    </kbd>
                    <span>{label}</span>
                </span>
            ))}
        </div>
    );
};
