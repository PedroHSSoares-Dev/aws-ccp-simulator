// ============================================================================
// Dashboard Screen - Main analytics dashboard
// ============================================================================

import { useState, useMemo, useRef } from 'react';
import { StatsCards } from './StatsCards';
import { EvolutionChart } from './EvolutionChart';
import { DomainHeatmap } from './DomainHeatmap';
import { WeakPointsPanel } from './WeakPointsPanel';
import { RecentExamsTable } from './RecentExamsTable';
import { TopMissedQuestions } from './TopMissedQuestions';
import { WeakPointsModal } from './WeakPointsModal';
import { DomainHistoryModal } from './DomainHistoryModal';
import { ResultsScreen } from '../results/ResultsScreen';
import { Button } from '../ui/Button';
import { useHistoryStore } from '../../stores/historyStore';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { AlertDialog } from '../ui/Modal';
import type { DomainKey, Question } from '../../types';

interface DashboardScreenProps {
    onBack: () => void;
    questions: Question[];
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onBack, questions }) => {
    const attempts = useHistoryStore((state) => state.attempts);
    const clearHistory = useHistoryStore((state) => state.clearHistory);
    const getTopMissedQuestions = useHistoryStore((state) => state.getTopMissedQuestions);

    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
    const [selectedDomain, setSelectedDomain] = useState<DomainKey | 'all'>('all');

    // Modal State
    const [activeModal, setActiveModal] = useState<'none' | 'weakPoints' | 'domainHistory'>('none');
    const [modalDomain, setModalDomain] = useState<DomainKey | null>(null);

    const handleWeakPointClick = (domain: DomainKey) => {
        setModalDomain(domain);
        setActiveModal('weakPoints');
    };

    const handleHeatmapClick = (domain: DomainKey) => {
        setModalDomain(domain);
        setActiveModal('domainHistory');
    };

    const closeModal = () => {
        setActiveModal('none');
        setModalDomain(null);
    };

    // Calculate domain history for modal
    const domainHistory = useMemo(() => {
        if (!modalDomain || activeModal !== 'domainHistory') return [];
        return attempts
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(a => ({
                date: a.date,
                score: a.domainScores[modalDomain]?.percentage || 0,
                passed: a.passed
            }));
    }, [attempts, modalDomain, activeModal]);


    const topMissedQuestions = useMemo(() => {
        return getTopMissedQuestions(20);
    }, [attempts, getTopMissedQuestions]);

    // Calculate stats
    const stats = useMemo(() => {
        if (attempts.length === 0) {
            return {
                totalExams: 0,
                passRate: 0,
                bestScore: 0,
                averageScore: 0,
                lastExamTrend: undefined,
            };
        }

        const passedCount = attempts.filter(a => a.passed).length;
        const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
        const avgScore = Math.round(totalScore / attempts.length);

        // Calculate trend from last 2 exams
        let trend: number | undefined;
        if (attempts.length >= 2) {
            const sorted = [...attempts].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            const lastScore = sorted[0].score;
            const previousScore = sorted[1].score;
            trend = Math.round(((lastScore - previousScore) / previousScore) * 100);
        }

        return {
            totalExams: attempts.length,
            passRate: Math.round((passedCount / attempts.length) * 100),
            bestScore: Math.max(...attempts.map(a => a.score)),
            averageScore: avgScore,
            lastExamTrend: trend,
        };
    }, [attempts]);

    // Evolution chart data
    const evolutionData = useMemo(() => {
        return [...attempts]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(a => ({
                date: a.date,
                score: a.score,
                passed: a.passed,
            }));
    }, [attempts]);

    // Domain performance data
    const domainPerformance = useMemo(() => {
        if (attempts.length === 0) return [];

        const domainStats: Record<DomainKey, { correct: number; total: number }> = {
            domain1: { correct: 0, total: 0 },
            domain2: { correct: 0, total: 0 },
            domain3: { correct: 0, total: 0 },
            domain4: { correct: 0, total: 0 },
        };

        // Aggregate all domain scores
        attempts.forEach(attempt => {
            if (attempt.domainScores) {
                (Object.keys(attempt.domainScores) as DomainKey[]).forEach(domain => {
                    const score = attempt.domainScores[domain];
                    if (score) {
                        domainStats[domain].correct += score.correct;
                        domainStats[domain].total += score.total;
                    }
                });
            }
        });

        return (Object.keys(domainStats) as DomainKey[])
            .map(domain => ({
                domain,
                correct: domainStats[domain].correct,
                total: domainStats[domain].total,
                percentage: domainStats[domain].total > 0
                    ? Math.round((domainStats[domain].correct / domainStats[domain].total) * 100)
                    : 0,
            }))
            .filter(d => d.total > 0);
    }, [attempts]);

    // Weak points based on domain performance
    const weakPoints = useMemo(() => {
        return domainPerformance
            .filter(d => d.percentage < 70)
            .sort((a, b) => a.percentage - b.percentage)
            .slice(0, 4)
            .map(d => {
                const domainNames: Record<DomainKey, string> = {
                    domain1: 'Cloud Concepts',
                    domain2: 'Security',
                    domain3: 'Technology',
                    domain4: 'Billing',
                };
                return {
                    domain: domainNames[d.domain],
                    rawDomain: d.domain,
                    topic: `${domainNames[d.domain]} - Conceitos Gerais`,
                    accuracy: d.percentage,
                    questionsWrong: d.total - d.correct,
                    maarekSection: `Seção: ${domainNames[d.domain]}`,
                };
            });
    }, [domainPerformance]);

    // Recent exams for table
    const recentExams = useMemo(() => {
        return [...attempts]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
            .map(a => ({
                id: a.id,
                date: a.date,
                score: a.score,
                passed: a.passed,
                duration: a.duration,
                mode: a.mode,
                totalQuestions: a.totalQuestions,
                correctAnswers: a.correctAnswers,
            }));
    }, [attempts]);
    // Find selected attempt
    const selectedAttempt = useMemo(() => {
        return attempts.find(a => a.id === selectedAttemptId);
    }, [attempts, selectedAttemptId]);

    // Render detailed view if attempt selected
    if (selectedAttempt) {
        return (
            <ResultsScreen
                attempt={selectedAttempt}
                questions={questions}
                onNewExam={() => {
                    // Logic to retry could go here, for now just go back
                    setSelectedAttemptId(null);
                    onBack();
                }}
                onGoHome={() => setSelectedAttemptId(null)}
                isHistoryView={true}
            // We don't verify dashboard because we are in dashboard
            />
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar
                        </Button>
                        <h1 className="text-xl font-bold text-text-primary">
                            Dashboard de Desempenho
                        </h1>
                    </div>
                    {attempts.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowClearConfirm(true)}
                            className="gap-2 text-error hover:bg-error/10"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Limpar Histórico
                        </Button>
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Stats Cards */}
                <StatsCards
                    totalExams={stats.totalExams}
                    passRate={stats.passRate}
                    bestScore={stats.bestScore}
                    averageScore={stats.averageScore}
                    lastExamTrend={stats.lastExamTrend}
                />

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <EvolutionChart data={evolutionData} />
                    <DomainHeatmap
                        domainPerformance={domainPerformance}
                        onDomainClick={handleHeatmapClick}
                    />
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <RecentExamsTable
                            attempts={recentExams}
                            onViewDetails={setSelectedAttemptId}
                        />
                    </div>
                    <WeakPointsPanel
                        weakPoints={weakPoints}
                        onPointClick={handleWeakPointClick}
                    />
                </div>

                {/* Top Missed Questions */}
                <div className="w-full">
                    <TopMissedQuestions
                        stats={topMissedQuestions}
                        questions={questions}
                        selectedDomain={selectedDomain}
                        onDomainSelect={setSelectedDomain}
                    />
                </div>
            </main>

            {/* Modals */}
            <WeakPointsModal
                isOpen={activeModal === 'weakPoints'}
                onClose={closeModal}
                domain={modalDomain}
                questions={questions}
            />

            <DomainHistoryModal
                isOpen={activeModal === 'domainHistory'}
                onClose={closeModal}
                domain={modalDomain}
                history={domainHistory}
            />

            <AlertDialog
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={clearHistory}
                title="Limpar Histórico?"
                message="Esta ação é irreversível. Todos os seus resultados de exames passados serão apagados permanentemente."
                confirmText="Sim, limpar tudo"
                cancelText="Cancelar"
                variant="danger"
            />
        </div >
    );
};
