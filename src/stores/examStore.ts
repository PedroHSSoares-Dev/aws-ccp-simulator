// ============================================================================
// Exam Store - Current Exam State Management
// ============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
    Question,
    ExamConfig,
    QuestionAnswer,
    ExamPhase,
    OptionId,
    DEFAULT_EXAM_CONFIG,
} from '../types';

interface ExamStore {
    // State
    id: string | null;
    config: ExamConfig | null;
    questions: Question[];
    currentIndex: number;
    answers: Record<string, QuestionAnswer>;
    markedForReview: string[];
    startTime: number | null;
    endTime: number | null;
    phase: ExamPhase;
    timeRemaining: number;

    // Derived getters (implemented as functions)
    currentQuestion: () => Question | null;
    getAnswer: (questionId: string) => QuestionAnswer | undefined;
    isMarkedForReview: (questionId: string) => boolean;
    answeredCount: () => number;
    markedCount: () => number;

    // Actions
    startExam: (config: ExamConfig, questions: Question[]) => void;
    answerQuestion: (questionId: string, selected: OptionId[]) => void;
    toggleMarkForReview: (questionId: string) => void;
    goToQuestion: (index: number) => void;
    nextQuestion: () => void;
    previousQuestion: () => void;
    updateTimeRemaining: (seconds: number) => void;
    finishExam: () => void;
    resetExam: () => void;
}

const generateExamId = (): string => {
    return `exam-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useExamStore = create<ExamStore>()(
    persist(
        (set, get) => ({
            // Initial state
            id: null,
            config: null,
            questions: [],
            currentIndex: 0,
            answers: {},
            markedForReview: [],
            startTime: null,
            endTime: null,
            phase: 'not-started',
            timeRemaining: 90 * 60, // 90 minutes in seconds

            // Derived getters
            currentQuestion: () => {
                const { questions, currentIndex } = get();
                return questions[currentIndex] ?? null;
            },

            getAnswer: (questionId: string) => {
                return get().answers[questionId];
            },

            isMarkedForReview: (questionId: string) => {
                return get().markedForReview.includes(questionId);
            },

            answeredCount: () => {
                return Object.keys(get().answers).length;
            },

            markedCount: () => {
                return get().markedForReview.length;
            },

            // Actions
            startExam: (config, questions) => {
                const id = generateExamId();
                set({
                    id,
                    config,
                    questions,
                    currentIndex: 0,
                    answers: {},
                    markedForReview: [],
                    startTime: Date.now(),
                    endTime: null,
                    phase: 'in-progress',
                    timeRemaining: config.duration * 60,
                });
            },

            answerQuestion: (questionId, selected) => {
                const { answers, startTime } = get();
                const existingAnswer = answers[questionId];
                const now = Date.now();

                set({
                    answers: {
                        ...answers,
                        [questionId]: {
                            questionId,
                            selected,
                            timeSpent: existingAnswer?.timeSpent ??
                                Math.floor((now - (startTime ?? now)) / 1000),
                        },
                    },
                });
            },

            toggleMarkForReview: (questionId) => {
                const { markedForReview } = get();
                const isMarked = markedForReview.includes(questionId);

                set({
                    markedForReview: isMarked
                        ? markedForReview.filter(id => id !== questionId)
                        : [...markedForReview, questionId],
                });
            },

            goToQuestion: (index) => {
                const { questions } = get();
                if (index >= 0 && index < questions.length) {
                    set({ currentIndex: index });
                }
            },

            nextQuestion: () => {
                const { currentIndex, questions } = get();
                if (currentIndex < questions.length - 1) {
                    set({ currentIndex: currentIndex + 1 });
                }
            },

            previousQuestion: () => {
                const { currentIndex } = get();
                if (currentIndex > 0) {
                    set({ currentIndex: currentIndex - 1 });
                }
            },

            updateTimeRemaining: (seconds) => {
                set({ timeRemaining: seconds });
            },

            finishExam: () => {
                set({
                    endTime: Date.now(),
                    phase: 'finished',
                });
            },

            resetExam: () => {
                set({
                    id: null,
                    config: null,
                    questions: [],
                    currentIndex: 0,
                    answers: {},
                    markedForReview: [],
                    startTime: null,
                    endTime: null,
                    phase: 'not-started',
                    timeRemaining: 90 * 60,
                });
            },
        }),
        {
            name: 'ccp-current-exam',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                id: state.id,
                config: state.config,
                questions: state.questions,
                currentIndex: state.currentIndex,
                answers: state.answers,
                markedForReview: state.markedForReview,
                startTime: state.startTime,
                endTime: state.endTime,
                phase: state.phase,
                timeRemaining: state.timeRemaining,
            }),
        }
    )
);
