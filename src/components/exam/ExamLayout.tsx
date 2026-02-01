import React, { useEffect, useCallback, useState } from 'react';
import { cn } from '../../lib/utils';
import { Timer } from './Timer';
import { Question } from './Question';
import { Navigation, ShortcutsHint } from './Navigation';
import { ProgressMap } from './ProgressMap';
import { AlertDialog } from '../ui/Modal';
import { Card } from '../ui/Card';
import { useExamStore } from '../../stores/examStore';
import { Menu, X, LayoutGrid, LogOut, Check, XCircle, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { OptionId, Question as QuestionType, DomainId, DomainKey } from '../../types';
import { DOMAIN_INFO } from '../../types';

interface ExamLayoutProps {
    onFinish: () => void;
    onExit: () => void;
}

export const ExamLayout: React.FC<ExamLayoutProps> = ({ onFinish, onExit }) => {
    const [showConfirmFinish, setShowConfirmFinish] = useState(false);
    const [showConfirmExit, setShowConfirmExit] = useState(false);
    const [showProgressPanel, setShowProgressPanel] = useState(false);
    const [confirmedQuestions, setConfirmedQuestions] = useState<Set<string>>(new Set());

    // Get exam state from store
    const {
        questions,
        currentIndex,
        answers,
        markedForReview,
        timeRemaining,
        config,
        currentQuestion,
        isMarkedForReview,
        answerQuestion,
        toggleMarkForReview,
        goToQuestion,
        nextQuestion,
        previousQuestion,
        updateTimeRemaining,
        finishExam,
    } = useExamStore();

    const question = currentQuestion();

    // Get current answer
    const currentAnswer = question ? answers[question.id] : undefined;
    const selectedOptions = currentAnswer?.selected ?? [];

    // Get domain info
    const getDomainKey = (domainId: DomainId): DomainKey => {
        const mapping: Record<DomainId, DomainKey> = {
            'domain1-cloud-concepts': 'domain1',
            'domain2-security': 'domain2',
            'domain3-technology': 'domain3',
            'domain4-billing': 'domain4',
        };
        return mapping[domainId];
    };

    const domainInfo = question
        ? DOMAIN_INFO[getDomainKey(question.domain)]
        : null;

    // Handle option selection
    const handleSelectOption = (optionId: OptionId) => {
        if (!question) return;

        // Don't allow changes after confirmation in practice mode
        if (config?.mode === 'practice' && confirmedQuestions.has(question.id)) return;

        if (question.type === 'single-choice') {
            // Single choice: replace selection
            answerQuestion(question.id, [optionId]);
        } else {
            // Multiple choice: toggle selection
            const newSelected = selectedOptions.includes(optionId)
                ? selectedOptions.filter((id) => id !== optionId)
                : [...selectedOptions, optionId];
            answerQuestion(question.id, newSelected);
        }
    };

    // Handle finish exam
    const handleFinishExam = () => {
        finishExam();
        onFinish();
    };

    // Handle confirm answer (practice mode)
    const handleConfirmAnswer = () => {
        if (!question || selectedOptions.length === 0) return;
        setConfirmedQuestions(prev => new Set([...prev, question.id]));
    };

    // Check if current question is confirmed
    const isCurrentQuestionConfirmed = question ? confirmedQuestions.has(question.id) : false;

    // Check if answer is correct (for feedback)
    const isAnswerCorrect = question ?
        question.correct.length === selectedOptions.length &&
        question.correct.every(c => selectedOptions.includes(c)) : false;

    // Focused option state for keyboard navigation
    const [focusedOptionIndex, setFocusedOptionIndex] = useState<number>(-1);

    // Reset focus when question changes
    useEffect(() => {
        setFocusedOptionIndex(-1);
    }, [currentIndex]);

    // Keyboard shortcuts
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (!question) return;

            const optionCount = question.options.length;

            // Number keys 1-5 for direct option selection
            if (['1', '2', '3', '4', '5'].includes(e.key)) {
                const optionIndex = parseInt(e.key) - 1;
                const options: OptionId[] = ['A', 'B', 'C', 'D', 'E'];
                if (optionIndex < optionCount) {
                    handleSelectOption(options[optionIndex]);
                }
                return;
            }

            // A-E for direct option selection
            if (['a', 'b', 'c', 'd', 'e'].includes(e.key.toLowerCase())) {
                const optionId = e.key.toUpperCase() as OptionId;
                if (question.options.some((o) => o.id === optionId)) {
                    handleSelectOption(optionId);
                }
                return;
            }

            switch (e.key) {
                // W/Up/S/Down for navigating between options
                case 'w':
                case 'W':
                case 'ArrowUp':
                    e.preventDefault();
                    if (focusedOptionIndex <= 0) {
                        setFocusedOptionIndex(optionCount - 1);
                    } else {
                        setFocusedOptionIndex(focusedOptionIndex - 1);
                    }
                    break;
                case 's':
                case 'S':
                case 'ArrowDown':
                    e.preventDefault();
                    if (focusedOptionIndex >= optionCount - 1) {
                        setFocusedOptionIndex(0);
                    } else {
                        setFocusedOptionIndex(focusedOptionIndex + 1);
                    }
                    break;

                // Enter to select focused option or go to next question
                case 'Enter':
                    e.preventDefault();
                    if (focusedOptionIndex >= 0 && focusedOptionIndex < optionCount) {
                        const focusedOption = question.options[focusedOptionIndex];
                        handleSelectOption(focusedOption.id);
                    } else if (currentIndex < questions.length - 1) {
                        nextQuestion();
                    }
                    break;

                // Arrow Left/Right for question navigation
                case 'ArrowRight':
                    e.preventDefault();
                    if (currentIndex < questions.length - 1) {
                        nextQuestion();
                    }
                    break;
                case 'ArrowLeft':
                case 'Backspace':
                    e.preventDefault();
                    if (currentIndex > 0) {
                        previousQuestion();
                    }
                    break;

                // M for mark
                case 'm':
                case 'M':
                    toggleMarkForReview(question.id);
                    break;

                // F for finish
                case 'f':
                case 'F':
                    setShowConfirmFinish(true);
                    break;

                case 'Escape':
                    setShowProgressPanel(false);
                    break;
            }
        },
        [question, currentIndex, questions.length, focusedOptionIndex]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-text-secondary">Carregando questão...</p>
            </div>
        );
    }

    // Calculate answered IDs
    const answeredIds = new Set(Object.keys(answers));
    const markedIds = new Set(markedForReview);
    const questionIds = questions.map((q) => q.id);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Left: Question info & Exit */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowConfirmExit(true)}
                            className="p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-card transition-colors"
                            aria-label="Exit exam"
                        >
                            <LogOut className="w-5 h-5 rotate-180" />
                        </button>

                        <h1 className="text-lg font-semibold text-text-primary hidden sm:block">
                            AWS CCP Exam
                        </h1>
                        {domainInfo && (
                            <span
                                className={cn(
                                    'px-2 py-1 rounded-full text-xs font-medium',
                                    `bg-${domainInfo.color}/20 text-${domainInfo.color}`
                                )}
                                style={{
                                    backgroundColor: `var(--color-${domainInfo.color}20)`,
                                    color: `var(--color-${domainInfo.color})`
                                }}
                            >
                                {domainInfo.shortName}
                            </span>
                        )}
                    </div>

                    {/* Center: Timer or Mode Badge */}
                    {config?.showTimer !== false ? (
                        <Timer
                            timeRemaining={timeRemaining}
                            onTick={updateTimeRemaining}
                        />
                    ) : (
                        <div className="px-4 py-2 rounded-lg bg-success/10 border border-success text-success font-medium">
                            Modo Prática (sem timer)
                        </div>
                    )}

                    {/* Right: Progress toggle (mobile) */}
                    <button
                        onClick={() => setShowProgressPanel(!showProgressPanel)}
                        className="lg:hidden p-2 rounded-lg hover:bg-card focus:outline-none focus:ring-2 focus:ring-aws-orange/50"
                        aria-label="Toggle progress panel"
                    >
                        {showProgressPanel ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <LayoutGrid className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex">
                {/* Question area */}
                <div className="flex-1 max-w-4xl mx-auto px-4 py-6 space-y-6">
                    <Question
                        question={question}
                        selectedOptions={selectedOptions}
                        onSelectOption={handleSelectOption}
                        focusedOptionIndex={focusedOptionIndex}
                        isSubmitted={config?.mode === 'practice' && isCurrentQuestionConfirmed}
                    />

                    {/* Practice Mode: Confirm Button */}
                    {config?.mode === 'practice' && !isCurrentQuestionConfirmed && selectedOptions.length > 0 && (
                        <div className="flex justify-center">
                            <button
                                onClick={handleConfirmAnswer}
                                className="px-6 py-3 bg-aws-light-blue text-white font-semibold rounded-lg hover:bg-aws-light-blue/90 transition-colors flex items-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Confirmar Resposta
                            </button>
                        </div>
                    )}

                    {/* Practice Mode: Feedback Panel */}
                    {config?.mode === 'practice' && isCurrentQuestionConfirmed && (
                        <Card className={cn(
                            'border-2',
                            isAnswerCorrect
                                ? 'bg-success/5 border-success/30'
                                : 'bg-error/5 border-error/30'
                        )}>
                            {/* Result Header */}
                            <div className="flex items-center gap-3 mb-4">
                                {isAnswerCorrect ? (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                                            <Check className="w-6 h-6 text-success" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-success">Resposta Correta!</h3>
                                            <p className="text-sm text-text-secondary">Muito bem! Continue assim.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                                            <XCircle className="w-6 h-6 text-error" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-error">Resposta Incorreta</h3>
                                            <p className="text-sm text-text-secondary">
                                                Resposta correta: {question.correct.join(', ')}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Explanation */}
                            <div className="bg-card rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-aws-light-blue mb-2">
                                    Explicação
                                </h4>
                                <div className="markdown-content text-sm text-text-secondary">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {question.explanation}
                                    </ReactMarkdown>
                                </div>

                                {/* References */}
                                {question.references && question.references.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-border">
                                        <h5 className="text-xs font-medium text-text-secondary mb-1">
                                            Referências
                                        </h5>
                                        <ul className="space-y-0.5">
                                            {question.references.map((ref, i) => (
                                                <li key={i}>
                                                    <a
                                                        href={ref}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-aws-light-blue hover:underline"
                                                    >
                                                        {ref}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Progress sidebar (desktop) */}
                <aside className="hidden lg:block w-72 border-l border-border p-4 bg-card/50">
                    <Card className="sticky top-24">
                        <h2 className="font-semibold text-text-primary mb-4">Progresso</h2>
                        <ProgressMap
                            totalQuestions={questions.length}
                            currentIndex={currentIndex}
                            answeredIds={answeredIds}
                            markedIds={markedIds}
                            questionIds={questionIds}
                            onQuestionClick={goToQuestion}
                        />
                    </Card>
                </aside>
            </main>

            {/* Mobile progress panel */}
            {showProgressPanel && (
                <div className="lg:hidden fixed inset-0 z-50 bg-background p-4 overflow-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-lg">Progresso</h2>
                        <button
                            onClick={() => setShowProgressPanel(false)}
                            className="p-2 rounded-lg hover:bg-card"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <ProgressMap
                        totalQuestions={questions.length}
                        currentIndex={currentIndex}
                        answeredIds={answeredIds}
                        markedIds={markedIds}
                        questionIds={questionIds}
                        onQuestionClick={(index) => {
                            goToQuestion(index);
                            setShowProgressPanel(false);
                        }}
                    />
                </div>
            )}

            {/* Footer with navigation */}
            <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border">
                <div className="max-w-4xl mx-auto px-4">
                    <Navigation
                        currentIndex={currentIndex}
                        totalQuestions={questions.length}
                        isMarked={isMarkedForReview(question.id)}
                        isAnswered={answeredIds.has(question.id)}
                        onPrevious={previousQuestion}
                        onNext={nextQuestion}
                        onToggleMark={() => toggleMarkForReview(question.id)}
                        onFinish={() => setShowConfirmFinish(true)}
                        isLastQuestion={currentIndex === questions.length - 1}
                    />
                    <div className="pb-3">
                        <ShortcutsHint />
                    </div>
                </div>
            </footer>

            {/* Confirm finish dialog */}
            <AlertDialog
                isOpen={showConfirmFinish}
                onClose={() => setShowConfirmFinish(false)}
                onConfirm={handleFinishExam}
                title="Finalizar Exame?"
                message={`Você respondeu ${answeredIds.size} de ${questions.length} questões. ${markedIds.size > 0
                    ? `${markedIds.size} questões estão marcadas para revisão.`
                    : ''
                    } Tem certeza que deseja finalizar?`}
                confirmText="Finalizar"
                cancelText="Continuar"
                variant="warning"
            />
            {/* Exit Confirmation Dialog */}
            <AlertDialog
                isOpen={showConfirmExit}
                onClose={() => setShowConfirmExit(false)}
                onConfirm={onExit}
                title="Sair do Exame?"
                message="Seu progresso será perdido. Tem certeza que deseja sair?"
                confirmText="Sair"
                cancelText="Continuar"
                variant="warning"
            />
        </div>
    );
};
