import React, { useMemo, useState } from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import {
    Play,
    Clock,
    Zap,
    AlertCircle,
    BarChart3,
    Settings,
    BookOpen,
    Trophy
} from 'lucide-react';
import { useHistoryStore } from '../stores/historyStore';
import { DOMAIN_INFO } from '../types';
import type { WrongAnswersConfig } from './modals/WrongAnswersConfigModal';
import { WrongAnswersConfigModal } from './modals/WrongAnswersConfigModal';
import type { PracticeModeConfig } from './modals/PracticeModeConfigModal';
import { PracticeModeConfigModal } from './modals/PracticeModeConfigModal';

interface HomeScreenProps {
    onStartExam: (mode: 'official' | 'practice' | 'quick' | 'wrong-answers', config?: WrongAnswersConfig | PracticeModeConfig) => void;
    onViewDashboard?: () => void;
    onOpenSettings?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
    onStartExam,
    onViewDashboard,
    onOpenSettings,
}) => {
    // Get raw data from store - do NOT call functions inside selector
    const attempts = useHistoryStore((state) => state.attempts);

    // State for modals
    const [showWrongAnswersModal, setShowWrongAnswersModal] = useState(false);
    const [showPracticeModeModal, setShowPracticeModeModal] = useState(false);

    // Compute derived data with useMemo to avoid infinite loops
    const stats = useMemo(() => {
        if (attempts.length === 0) {
            return { totalExams: 0, passRate: 0, bestScore: 0 };
        }
        const passedCount = attempts.filter(a => a.passed).length;
        const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
        return {
            totalExams: attempts.length,
            passRate: Math.round((passedCount / attempts.length) * 100),
            bestScore: Math.max(...attempts.map(a => a.score)),
        };
    }, [attempts]);

    const recentAttempts = useMemo(() => {
        return [...attempts]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);
    }, [attempts]);

    return (
        <div className="min-h-screen bg-background">
            {/* Hero section */}
            <div className="bg-gradient-to-br from-aws-dark-blue via-aws-dark-blue to-aws-dark-blue/90">
                {/* Professional Banner */}
                <div className="bg-aws-orange/90 text-white py-2 px-4 text-center text-sm font-medium">
                    <span className="mr-2">☁️</span>
                    Simulador Atualizado para o Exame CLF-C02 (2025)
                </div>

                <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-aws-orange/20 text-aws-orange px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                            <BookOpen className="w-4 h-4" />
                            <span>CCP-02 Exam Simulator</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            AWS Cloud Practitioner
                        </h1>
                        <p className="text-lg text-white/70 max-w-2xl mx-auto">
                            Practice with realistic exam simulations, track your progress, and
                            master the skills needed to pass the AWS CCP certification.
                        </p>

                        {/* Dashboard button */}
                        {onViewDashboard && (
                            <div className="mt-6">
                                <Button
                                    variant="outline"
                                    onClick={onViewDashboard}
                                    className="border-white/30 text-white hover:bg-white/10"
                                >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Ver Dashboard
                                </Button>
                            </div>
                        )}

                        {/* Quick stats if user has history */}
                        {stats.totalExams > 0 && (
                            <div className="flex flex-wrap justify-center gap-6 mt-8">
                                <div className="text-center">
                                    <span className="block text-3xl font-bold text-aws-orange">
                                        {stats.totalExams}
                                    </span>
                                    <span className="text-sm text-white/60">Exames Feitos</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-3xl font-bold text-success">
                                        {stats.passRate}%
                                    </span>
                                    <span className="text-sm text-white/60">Taxa de Aprovação</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-3xl font-bold text-white">
                                        {stats.bestScore}
                                    </span>
                                    <span className="text-sm text-white/60">Melhor Nota</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <main className="max-w-4xl mx-auto px-4 py-8 -mt-8 relative z-10">
                {/* Exam mode cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Official Exam */}
                    <Card
                        variant="interactive"
                        className="group"
                        onClick={() => onStartExam('official')}
                    >
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-14 h-14 rounded-full bg-aws-orange/10 flex items-center justify-center mb-4 group-hover:bg-aws-orange/20 transition-colors">
                                <Play className="w-6 h-6 text-aws-orange" />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-1">
                                Simulado Oficial
                            </h3>
                            <p className="text-sm text-text-secondary mb-3">
                                65 questões em 90 minutos
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 text-xs">
                                <span className="px-2 py-0.5 bg-card rounded-full text-text-secondary">
                                    Cronometrado
                                </span>
                                <span className="px-2 py-0.5 bg-card rounded-full text-text-secondary">
                                    Aleatório
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Practice Mode */}
                    <Card
                        variant="interactive"
                        className="group"
                        onClick={() => setShowPracticeModeModal(true)}
                    >
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-14 h-14 rounded-full bg-aws-light-blue/10 flex items-center justify-center mb-4 group-hover:bg-aws-light-blue/20 transition-colors">
                                <BookOpen className="w-6 h-6 text-aws-light-blue" />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-1">
                                Modo Prática
                            </h3>
                            <p className="text-sm text-text-secondary mb-3">
                                Aprenda no seu ritmo
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 text-xs">
                                <span className="px-2 py-0.5 bg-card rounded-full text-text-secondary">
                                    Sem Tempo
                                </span>
                                <span className="px-2 py-0.5 bg-card rounded-full text-text-secondary">
                                    Feedback Instantâneo
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Quiz */}
                    <Card
                        variant="interactive"
                        className="group"
                        onClick={() => onStartExam('quick')}
                    >
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                                <Zap className="w-6 h-6 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-1">
                                Quiz Rápido
                            </h3>
                            <p className="text-sm text-text-secondary mb-3">
                                20 questões em 30 minutos
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 text-xs">
                                <span className="px-2 py-0.5 bg-card rounded-full text-text-secondary">
                                    Curto
                                </span>
                                <span className="px-2 py-0.5 bg-card rounded-full text-text-secondary">
                                    Revisão
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Wrong Answers Mode */}
                    <Card
                        variant="interactive"
                        className="group"
                        onClick={() => setShowWrongAnswersModal(true)}
                    >
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mb-4 group-hover:bg-error/20 transition-colors">
                                <AlertCircle className="w-6 h-6 text-error" />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-1">
                                Revisão de Erros
                            </h3>
                            <p className="text-sm text-text-secondary mb-3">
                                Refaça questões erradas
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 text-xs">
                                <span className="px-2 py-0.5 bg-card rounded-full text-text-secondary">
                                    Foco
                                </span>
                                <span className="px-2 py-0.5 bg-card rounded-full text-text-secondary">
                                    Melhoria
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Domain coverage */}
                <Card className="mb-8">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">
                        Cobertura por Domínio (CCP-02)
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(DOMAIN_INFO).map(([key, info]) => (
                            <div
                                key={key}
                                className="flex items-center gap-3 p-3 rounded-lg bg-card"
                            >
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: `var(--color-${info.color})` }}
                                />
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-text-primary block truncate">
                                        {info.name}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-text-secondary">
                                    {Math.round(info.weight * 100)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent attempts */}
                {recentAttempts.length > 0 && (
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-text-primary">
                                Tentativas Recentes
                            </h2>
                            {onViewDashboard && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onViewDashboard}
                                    rightIcon={<BarChart3 className="w-4 h-4" />}
                                >
                                    Ver Todos
                                </Button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {recentAttempts.map((attempt) => (
                                <div
                                    key={attempt.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-card"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'w-10 h-10 rounded-full flex items-center justify-center',
                                                attempt.passed ? 'bg-success/10' : 'bg-error/10'
                                            )}
                                        >
                                            {attempt.passed ? (
                                                <Trophy className="w-5 h-5 text-success" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-error" />
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-sm font-medium text-text-primary">
                                                {new Date(attempt.date).toLocaleDateString()}
                                            </span>
                                            <span className="text-xs text-text-secondary">
                                                {attempt.correctAnswers}/{attempt.totalQuestions} corretas
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={cn(
                                                'block text-lg font-bold',
                                                attempt.passed ? 'text-success' : 'text-error'
                                            )}
                                        >
                                            {attempt.score}
                                        </span>
                                        <span className="text-xs text-text-secondary">
                                            {attempt.passed ? 'Aprovado' : 'Não Aprovado'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-6 mt-8">
                <div className="max-w-4xl mx-auto px-4 text-center text-sm text-text-secondary space-y-2">
                    <p className="text-warning font-medium">
                        ⚠️ 100% Gerado por IA - Não confie cegamente nas respostas, revise sempre!
                    </p>
                    <p>
                        Este simulador exibe questões criadas por uma Large Language Model (LLM). Verifique sempre com a documentação oficial.
                    </p>
                </div>
            </footer>


            {/* Config Modals */}
            <WrongAnswersConfigModal
                isOpen={showWrongAnswersModal}
                onClose={() => setShowWrongAnswersModal(false)}
                onStart={(config) => onStartExam('wrong-answers', config)}
            />
            <PracticeModeConfigModal
                isOpen={showPracticeModeModal}
                onClose={() => setShowPracticeModeModal(false)}
                onStart={(config) => onStartExam('practice', config)}
            />
        </div >
    );
};
