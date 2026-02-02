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
            trend = previousScore === 0 ? 100 : Math.round(((lastScore - previousScore) / previousScore) * 100);
        }

        return {
            totalExams: attempts.length,
            passRate: Math.round((passedCount / attempts.length) * 100),
            bestScore: Math.max(...attempts.map(a => a.score)),
            averageScore: avgScore,
            lastExamTrend: trend,
        };
    }, [attempts]);

    // Filter data based on selected mode
    const [chartMode, setChartMode] = useState<'all' | 'official' | 'practice'>('all');

    const evolutionData = useMemo(() => {
        let filteredAttempts = [...attempts];

        if (chartMode === 'official') {
            filteredAttempts = filteredAttempts.filter(a => a.mode === 'official');
        } else if (chartMode === 'practice') {
            filteredAttempts = filteredAttempts.filter(a => a.mode === 'practice' || a.mode === 'quick');
        }

        return filteredAttempts
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(a => ({
                date: a.date,
                score: a.score,
                passed: a.passed,
            }));
    }, [attempts, chartMode]);

    // ... (rest of the code)

    {/* Charts Row */ }
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
            <div className="flex justify-end">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                        type="button"
                        onClick={() => setChartMode('all')}
                        className={`px-3 py-1.5 text-xs font-medium border rounded-l-lg ${chartMode === 'all'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-text-secondary border-border hover:bg-muted'
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        type="button"
                        onClick={() => setChartMode('official')}
                        className={`px-3 py-1.5 text-xs font-medium border-t border-b border-r ${chartMode === 'official'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-text-secondary border-border hover:bg-muted'
                            }`}
                    >
                        Oficial
                    </button>
                    <button
                        type="button"
                        onClick={() => setChartMode('practice')}
                        className={`px-3 py-1.5 text-xs font-medium border-t border-b border-r rounded-r-lg ${chartMode === 'practice'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-text-secondary border-border hover:bg-muted'
                            }`}
                    >
                        Prática
                    </button>
                </div>
            </div>
            <EvolutionChart data={evolutionData} />
        </div>
        <DomainHeatmap
            domainPerformance={domainPerformance}
            onDomainClick={handleHeatmapClick}
        />
    </div>

    {/* Bottom Row */ }
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

    {/* Top Missed Questions */ }
    <div className="w-full">
        <TopMissedQuestions
            stats={topMissedQuestions}
            questions={questions}
            selectedDomain={selectedDomain}
            onDomainSelect={setSelectedDomain}
        />
    </div>
            </main >

    {/* Modals */ }
    < WeakPointsModal
isOpen = { activeModal === 'weakPoints'}
onClose = { closeModal }
domain = { modalDomain }
questions = { questions }
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
