// ============================================================================
// useKeyboardShortcuts - Hook for Exam Keyboard Navigation
// ============================================================================

import { useEffect, useCallback } from 'react';
import { useExamStore } from '../stores/examStore';

interface KeyboardShortcutsOptions {
    enabled?: boolean;
    onFinish?: () => void;
}

/**
 * Hook that enables keyboard shortcuts during exam
 * 
 * Shortcuts:
 * - Arrow Left / Backspace: Previous question
 * - Arrow Right / Enter: Next question
 * - 1-4 / A-D: Select answer option
 * - M: Toggle mark for review
 * - F: Focus finish button (if on last question)
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
    const { enabled = true, onFinish } = options;

    const {
        questions,
        currentIndex,
        answers,
        goToQuestion,
        answerQuestion,
        toggleMarkForReview,
        phase,
    } = useExamStore();

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Don't handle if not in exam or disabled
        if (!enabled || phase !== 'in-progress') return;

        // Don't handle if user is typing in an input
        if (
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLTextAreaElement
        ) {
            return;
        }

        const key = e.key.toLowerCase();

        switch (key) {
            // Navigation
            case 'arrowleft':
            case 'backspace':
                e.preventDefault();
                if (currentIndex > 0) {
                    goToQuestion(currentIndex - 1);
                }
                break;

            case 'arrowright':
            case 'enter':
                e.preventDefault();
                if (currentIndex < totalQuestions - 1) {
                    goToQuestion(currentIndex + 1);
                }
                break;

            // Answer selection (1-4 or A-D)
            case '1':
            case 'a':
                e.preventDefault();
                selectAnswerByIndex(0);
                break;
            case '2':
            case 'b':
                e.preventDefault();
                selectAnswerByIndex(1);
                break;
            case '3':
            case 'c':
                e.preventDefault();
                selectAnswerByIndex(2);
                break;
            case '4':
            case 'd':
                e.preventDefault();
                selectAnswerByIndex(3);
                break;

            // Mark for review
            case 'm':
                e.preventDefault();
                if (currentQuestion) {
                    toggleMarkForReview(currentQuestion.id);
                }
                break;

            // Finish exam (F key on last question)
            case 'f':
                if (currentIndex === totalQuestions - 1 && onFinish) {
                    e.preventDefault();
                    onFinish();
                }
                break;
        }
    }, [
        enabled,
        phase,
        currentIndex,
        totalQuestions,
        goToQuestion,
        currentQuestion,
        toggleMarkForReview,
        onFinish,
    ]);

    const selectAnswerByIndex = useCallback((index: number) => {
        if (!currentQuestion) return;

        const options = currentQuestion.options;
        if (index >= options.length) return;

        const optionId = options[index].id;
        const currentAnswer = answers[currentQuestion.id];
        const currentSelected = currentAnswer?.selected || [];
        const isMultiple = currentQuestion.type === 'multiple-choice';

        if (isMultiple) {
            // Toggle the option
            if (currentSelected.includes(optionId)) {
                answerQuestion(currentQuestion.id, currentSelected.filter((id: string) => id !== optionId));
            } else {
                answerQuestion(currentQuestion.id, [...currentSelected, optionId]);
            }
        } else {
            // Single choice - replace
            answerQuestion(currentQuestion.id, [optionId]);
        }
    }, [currentQuestion, answers, answerQuestion]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return {
        shortcuts: [
            { key: '← / Backspace', action: 'Questão anterior' },
            { key: '→ / Enter', action: 'Próxima questão' },
            { key: '1-4 / A-D', action: 'Selecionar opção' },
            { key: 'M', action: 'Marcar para revisão' },
            { key: 'F', action: 'Finalizar exame' },
        ],
    };
}
