// ============================================================================
// History Store - Exam History & Statistics
// ============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ExamAttempt, DomainScores, DomainKey, Question } from '../types';
import { allQuestions } from '../data/questionLoader'; // Need access to questions for domain filtering

export type WrongAnswersConfig = {
    maxQuestions: number | 'all';
    selectedDomains: DomainKey[];
    sortBy: 'recent' | 'frequent';
};

interface HistoryStats {
    totalExams: number;
    passRate: number;
    averageScore: number;
    bestScore: number;
    averageDuration: number;
    domainAverages: Record<DomainKey, number>;
}

interface HistoryStore {
    // State
    attempts: ExamAttempt[];
    schemaVersion: number;

    // Getters
    getRecentAttempts: (count: number) => ExamAttempt[];
    getRecentQuestionIds: (recentCount: number) => string[];
    getWrongQuestionIds: () => string[];
    getFilteredWrongQuestionIds: (filters: { domains: DomainKey[], sortBy: 'recent' | 'frequent' }) => string[];
    getStats: () => HistoryStats;
    getWeakDomains: () => DomainKey[];
    getTopMissedQuestions: (limit?: number) => Array<{ questionId: string; count: number; domain: DomainKey }>;
    getMissedQuestionsByDomain: (domain: DomainKey) => Array<{ questionId: string; count: number }>;


    // Actions
    addAttempt: (attempt: ExamAttempt) => void;
    deleteAttempt: (id: string) => void;
    clearHistory: () => void;
}

const calculateStats = (attempts: ExamAttempt[]): HistoryStats => {
    if (attempts.length === 0) {
        return {
            totalExams: 0,
            passRate: 0,
            averageScore: 0,
            bestScore: 0,
            averageDuration: 0,
            domainAverages: {
                domain1: 0,
                domain2: 0,
                domain3: 0,
                domain4: 0,
            },
        };
    }

    const passedCount = attempts.filter(a => a.passed).length;
    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
    const totalDuration = attempts.reduce((sum, a) => sum + a.duration, 0);

    // Calculate domain averages
    const domainTotals: Record<DomainKey, { sum: number; count: number }> = {
        domain1: { sum: 0, count: 0 },
        domain2: { sum: 0, count: 0 },
        domain3: { sum: 0, count: 0 },
        domain4: { sum: 0, count: 0 },
    };

    attempts.forEach(attempt => {
        (Object.keys(attempt.domainScores) as DomainKey[]).forEach(domain => {
            const score = attempt.domainScores[domain];
            domainTotals[domain].sum += score.percentage;
            domainTotals[domain].count += 1;
        });
    });

    const domainAverages: Record<DomainKey, number> = {
        domain1: domainTotals.domain1.count > 0 ? domainTotals.domain1.sum / domainTotals.domain1.count : 0,
        domain2: domainTotals.domain2.count > 0 ? domainTotals.domain2.sum / domainTotals.domain2.count : 0,
        domain3: domainTotals.domain3.count > 0 ? domainTotals.domain3.sum / domainTotals.domain3.count : 0,
        domain4: domainTotals.domain4.count > 0 ? domainTotals.domain4.sum / domainTotals.domain4.count : 0,
    };

    return {
        totalExams: attempts.length,
        passRate: Math.round((passedCount / attempts.length) * 100),
        averageScore: Math.round(totalScore / attempts.length),
        bestScore: Math.max(...attempts.map(a => a.score)),
        averageDuration: Math.round(totalDuration / attempts.length),
        domainAverages,
    };
};

export const useHistoryStore = create<HistoryStore>()(
    persist(
        (set, get) => ({
            // Initial state
            attempts: [],
            schemaVersion: 1,

            // Getters
            getRecentAttempts: (count) => {
                return get().attempts
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, count);
            },

            getRecentQuestionIds: (recentCount = 3) => {
                const recentAttempts = get().getRecentAttempts(recentCount);
                const questionIds = new Set<string>();

                recentAttempts.forEach(attempt => {
                    attempt.questionsUsed.forEach(id => questionIds.add(id));
                });

                return Array.from(questionIds);
            },

            getWrongQuestionIds: () => {
                const wrongIds = new Set<string>();

                get().attempts.forEach(attempt => {
                    attempt.answers.forEach(answer => {
                        if (!answer.correct) {
                            wrongIds.add(answer.questionId);
                        }
                    });
                });

                return Array.from(wrongIds);
            },

            getFilteredWrongQuestionIds: ({ domains, sortBy }) => {
                const attempts = get().attempts;
                const questionFrequency = new Map<string, number>();
                const questionLastSeen = new Map<string, number>(); // helper for recency if needed, though attempts are ordered

                // 1. Collect all wrong answers with frequency
                attempts.forEach((attempt, index) => {
                    attempt.answers.forEach(answer => {
                        if (!answer.correct) {
                            const currentFreq = questionFrequency.get(answer.questionId) || 0;
                            questionFrequency.set(answer.questionId, currentFreq + 1);

                            // Track index for recency (higher index = more recent attempt in default sort usually)
                            // Actually attempts are stored chronological? Check addAttempt logic. 
                            // Usually added to end? store.addAttempt implementation:
                            // set((state) => ({ attempts: [...state.attempts, attempt] }))
                            // So higher index is more recent.
                            questionLastSeen.set(answer.questionId, index);
                        }
                    });
                });

                let allWrongIds = Array.from(questionFrequency.keys());

                // 2. Filter by Domain
                // We need to look up the domain for each question ID.
                // Assuming format "d1-..." maps to domain1, but safer to lookup in allQuestions
                const questionDomainMap = new Map(allQuestions.map(q => [q.id, q.domain]));

                // Helper to map DomainId to DomainKey
                const getDomainKey = (dId: string): DomainKey => {
                    if (dId.includes('domain1')) return 'domain1';
                    if (dId.includes('domain2')) return 'domain2';
                    if (dId.includes('domain3')) return 'domain3';
                    if (dId.includes('domain4')) return 'domain4';
                    return 'domain1'; // fallback
                };

                allWrongIds = allWrongIds.filter(id => {
                    const domainId = questionDomainMap.get(id);
                    if (!domainId) return false; // question not found?
                    const key = getDomainKey(domainId);
                    return domains.includes(key);
                });

                // 3. Sort
                if (sortBy === 'frequent') {
                    // High frequency first
                    allWrongIds.sort((a, b) => {
                        const freqA = questionFrequency.get(a) || 0;
                        const freqB = questionFrequency.get(b) || 0;
                        return freqB - freqA;
                    });
                } else {
                    // Recent first (default logical assumption for "recent errors")
                    // Sort by last seen attempt index (descending)
                    allWrongIds.sort((a, b) => {
                        const lastA = questionLastSeen.get(a) || 0;
                        const lastB = questionLastSeen.get(b) || 0;
                        return lastB - lastA;
                    });
                }

                return allWrongIds;
            },

            getStats: () => {
                return calculateStats(get().attempts);
            },

            getWeakDomains: () => {
                const stats = calculateStats(get().attempts);
                const threshold = 70; // Consider weak if below 70%

                return (Object.entries(stats.domainAverages) as [DomainKey, number][])
                    .filter(([_, avg]) => avg < threshold && avg > 0)
                    .sort(([, a], [, b]) => a - b)
                    .map(([domain]) => domain);
            },

            // Actions
            getTopMissedQuestions: (limit = 10) => {
                const { attempts } = get();
                const invalidCounts = new Map<string, number>();
                const questionDomains = new Map<string, DomainKey>();

                // Helper to get domain key
                const getDomainKey = (domain: string): DomainKey => {
                    const mapping: Record<string, DomainKey> = {
                        'domain1-cloud-concepts': 'domain1',
                        'domain2-security': 'domain2',
                        'domain3-technology': 'domain3',
                        'domain4-billing': 'domain4',
                    };
                    return mapping[domain] || 'domain1';
                };

                // Aggregate wrong answers
                attempts.forEach(attempt => {
                    attempt.answers.forEach(ans => {
                        if (!ans.correct) {
                            const current = invalidCounts.get(ans.questionId) || 0;
                            invalidCounts.set(ans.questionId, current + 1);

                            // We need question domain. Since we don't have the question object here easily, 
                            // we rely on it being available or we map it later. 
                            // ACTUALLY, we can't easily get domain without the questions array.
                            // But wait, allQuestions is imported at the top of this file!
                        }
                    });
                });

                // Convert to array and sort
                const questionsMap = new Map(allQuestions.map(q => [q.id, q]));

                return Array.from(invalidCounts.entries())
                    .map(([questionId, count]) => {
                        const q = questionsMap.get(questionId);
                        // Map domain ID to Key
                        const domainId = q?.domain || 'domain1-cloud-concepts';
                        const mapping: Record<string, DomainKey> = {
                            'domain1-cloud-concepts': 'domain1',
                            'domain2-security': 'domain2',
                            'domain3-technology': 'domain3',
                            'domain4-billing': 'domain4',
                        };

                        return {
                            questionId,
                            count,
                            domain: mapping[domainId]
                        };
                    })
                    .sort((a, b) => b.count - a.count)
                    .slice(0, limit);
            },

            getMissedQuestionsByDomain: (domain: DomainKey) => {
                const { attempts } = get();
                const invalidCounts = new Map<string, number>();
                const questionsMap = new Map(allQuestions.map(q => [q.id, q]));

                // Helper to check domain
                // Map DomainKey to possible IDs or just check standard mapping
                const isQuestionInDomain = (q: Question) => {
                    if (domain === 'domain1') return q.domain.includes('domain1');
                    if (domain === 'domain2') return q.domain.includes('domain2');
                    if (domain === 'domain3') return q.domain.includes('domain3');
                    if (domain === 'domain4') return q.domain.includes('domain4');
                    return false;
                };

                attempts.forEach(attempt => {
                    attempt.answers.forEach(ans => {
                        if (!ans.correct) {
                            const q = questionsMap.get(ans.questionId);
                            if (q && isQuestionInDomain(q)) {
                                const current = invalidCounts.get(ans.questionId) || 0;
                                invalidCounts.set(ans.questionId, current + 1);
                            }
                        }
                    });
                });

                return Array.from(invalidCounts.entries())
                    .map(([questionId, count]) => ({ questionId, count }))
                    .sort((a, b) => b.count - a.count);
            },

            addAttempt: (attempt) => {
                set(state => ({
                    attempts: [...state.attempts, attempt],
                }));

                // Sync with API (fire and forget)
                import('../lib/api').then(({ saveAttempt }) => {
                    saveAttempt({
                        id: attempt.id,
                        date: attempt.date,
                        mode: attempt.mode,
                        score: attempt.score,
                        totalQuestions: attempt.totalQuestions,
                        correctAnswers: attempt.correctAnswers,
                        timeSpent: attempt.duration,
                        answers: attempt.answers.reduce((acc, a) => ({ ...acc, [a.questionId]: a.selected }), {}),
                        domainScores: Object.fromEntries(
                            Object.entries(attempt.domainScores).map(([k, v]) => [k, { correct: v.correct, total: v.total }])
                        ),
                    });
                });
            },

            deleteAttempt: (id) => {
                set(state => ({
                    attempts: state.attempts.filter(a => a.id !== id),
                }));
            },

            clearHistory: () => {
                set({ attempts: [] });

                // Sync with API (fire and forget)
                import('../lib/api').then(({ clearHistory }) => {
                    clearHistory();
                });
            },
        }),
        {
            name: 'ccp-exam-history',
            storage: createJSONStorage(() => localStorage),
            version: 1,
            migrate: (persistedState: any, version) => {
                // Handle schema migrations here
                if (version === 0) {
                    // Migration from version 0 to 1
                    return {
                        ...persistedState,
                        schemaVersion: 1,
                    };
                }
                return persistedState;
            },
        }
    )
);
