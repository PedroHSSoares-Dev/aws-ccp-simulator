import React, { useMemo, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import {
    Play,
    BarChart2,
    CheckCircle2,
    Shield,
    Globe,
    Zap,
    BookOpen,
    ArrowRight,
    Github,
    Code,
    Clock,
    AlertTriangle,
    Info,
    Layout
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useHistoryStore } from '../stores/historyStore';
import type { WrongAnswersConfig } from './modals/WrongAnswersConfigModal';
import { WrongAnswersConfigModal } from './modals/WrongAnswersConfigModal';
import type { PracticeModeConfig } from './modals/PracticeModeConfigModal';
import { PracticeModeConfigModal } from './modals/PracticeModeConfigModal';
import { ConfirmationModal } from './modals/ConfirmationModal';

interface HomeScreenProps {
    onStartExam: (mode: 'official' | 'practice' | 'quick' | 'wrong-answers', config?: WrongAnswersConfig | PracticeModeConfig) => void;
    onViewDashboard: () => void;
    onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
    onStartExam,
    onViewDashboard,
    onOpenSettings,
}) => {
    // Get raw data from store
    const attempts = useHistoryStore((state) => state.attempts);

    // State for modals
    const [showWrongAnswersModal, setShowWrongAnswersModal] = useState(false);
    const [showPracticeModeModal, setShowPracticeModeModal] = useState(false);

    // Confirmation State
    const [pendingMode, setPendingMode] = useState<'official' | 'quick' | null>(null);

    // Compute simple stats
    const userStats = useMemo(() => {
        if (attempts.length === 0) return null;
        const passedCount = attempts.filter(a => a.passed).length;
        return {
            total: attempts.length,
            passRate: Math.round((passedCount / attempts.length) * 100),
            bestScore: Math.max(...attempts.map(a => a.score)),
        };
    }, [attempts]);

    const handleModeClick = (mode: 'official' | 'quick') => {
        setPendingMode(mode);
    };

    const confirmStartExam = () => {
        if (pendingMode) {
            onStartExam(pendingMode);
            setPendingMode(null);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-aws-orange/20">
            {/* Simple Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-lg text-text-primary">
                        <span className="text-aws-orange">AWS</span>
                        <span>Simulator</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-border text-text-secondary ml-2 font-normal">v1.0 (Free)</span>
                    </div>
                    <nav className="flex gap-4 text-sm font-medium text-text-secondary">
                        <a href="https://aws.amazon.com/certification/certified-cloud-practitioner/" target="_blank" rel="noopener noreferrer" className="hover:text-aws-orange transition-colors hidden sm:flex items-center gap-1">
                            <Info className="w-3 h-3" /> Docs Oficiais
                        </a>
                        <a href="https://github.com/PedroHSSoares-Dev/aws-ccp-simulator/issues" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors flex items-center gap-1">
                            <Github className="w-4 h-4" /> Reportar Bug
                        </a>
                    </nav>
                </div>
            </header>

            {/* Hero Section - Grounded Design */}
            <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aws-light-blue/10 text-aws-light-blue text-xs font-bold uppercase tracking-wide mb-6">
                            Cloud Practitioner CLF-C02
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-text-primary mb-6">
                            Simulador Gratuito para Certificação AWS
                        </h1>
                        <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                            Uma ferramenta open-source para estudar. Sem paywall, sem login obrigatório.
                            Apenas questões baseadas em documentação oficial para você treinar no seu tempo.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Button
                                size="lg"
                                className="font-semibold shadow-sm"
                                onClick={() => handleModeClick('official')}
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Começar Simulado
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="bg-background"
                                onClick={onViewDashboard}
                            >
                                <BarChart2 className="w-4 h-4 mr-2" />
                                Meu Progresso
                            </Button>
                        </div>

                        <div className="mt-8 flex items-center gap-6 text-sm text-text-secondary">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-success" /> 1.200+ Questões
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-aws-light-blue" /> 4 Domínios
                            </div>
                            <div className="flex items-center gap-2">
                                <Code className="w-4 h-4 text-text-tertiary" /> Open Source
                            </div>
                        </div>
                    </div>

                    {/* Preview / Video */}
                    <div className="relative rounded-xl border border-border shadow-md overflow-hidden bg-card">
                        <div className="aspect-video bg-black/5 flex items-center justify-center">
                            <video
                                src="/demo.webp"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Exam Modes Grid - Side by Side */}
            <section className="border-t border-border bg-card/30 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-text-primary">Modos de Estudo</h2>
                        <p className="text-text-secondary">Escolha como você quer praticar hoje</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Official Mode */}
                        <Card
                            variant="interactive"
                            className="p-5 flex flex-col h-full hover:border-aws-orange/50 transition-colors"
                            onClick={() => handleModeClick('official')}
                        >
                            <div className="w-10 h-10 rounded-lg bg-aws-orange/10 flex items-center justify-center mb-4 text-aws-orange">
                                <Play className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-text-primary mb-2">Simulado Oficial</h3>
                            <p className="text-sm text-text-secondary flex-1 mb-4">
                                Imita as condições reais da prova. 65 questões, 90 minutos, cronometrado.
                            </p>
                            <div className="text-xs font-mono text-text-tertiary bg-background p-2 rounded border border-border mt-auto">
                                Ideal para: Teste final
                            </div>
                        </Card>

                        {/* Practice Mode */}
                        <Card
                            variant="interactive"
                            className="p-5 flex flex-col h-full hover:border-aws-light-blue/50 transition-colors"
                            onClick={() => setShowPracticeModeModal(true)}
                        >
                            <div className="w-10 h-10 rounded-lg bg-aws-light-blue/10 flex items-center justify-center mb-4 text-aws-light-blue">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-text-primary mb-2">Modo Prática</h3>
                            <p className="text-sm text-text-secondary flex-1 mb-4">
                                Sem tempo. Responda e veja a explicação imediatamente. Configure quantas questões quiser.
                            </p>
                            <div className="text-xs font-mono text-text-tertiary bg-background p-2 rounded border border-border mt-auto">
                                Ideal para: Estudar
                            </div>
                        </Card>

                        {/* Quick Exam */}
                        <Card
                            variant="interactive"
                            className="p-5 flex flex-col h-full hover:border-success/50 transition-colors"
                            onClick={() => handleModeClick('quick')}
                        >
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-4 text-success">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-text-primary mb-2">Quick Quiz</h3>
                            <p className="text-sm text-text-secondary flex-1 mb-4">
                                Tem 15 minutos livres? Faça um teste rápido de 20 questões aleatórias.
                            </p>
                            <div className="text-xs font-mono text-text-tertiary bg-background p-2 rounded border border-border mt-auto">
                                Ideal para: Revisão rápida
                            </div>
                        </Card>

                        {/* Wrong Answers */}
                        <Card
                            variant="interactive"
                            className="p-5 flex flex-col h-full hover:border-error/50 transition-colors"
                            onClick={() => setShowWrongAnswersModal(true)}
                        >
                            <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center mb-4 text-error">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-text-primary mb-2">Revisão de Erros</h3>
                            <p className="text-sm text-text-secondary flex-1 mb-4">
                                O sistema lembra o que você errou. Gere uma prova focada apenas nas suas falhas.
                            </p>
                            <div className="text-xs font-mono text-text-tertiary bg-background p-2 rounded border border-border mt-auto">
                                Ideal para: Tapar buracos
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Footer / Privacy / Disclaimer */}
            <footer className="border-t border-border bg-card py-10 mt-auto">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-6">

                    <div className="flex flex-col items-center gap-2 p-4 bg-background border border-border rounded-lg max-w-2xl mx-auto">
                        <div className="flex items-center gap-2 text-warning font-medium">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Aviso sobre Inteligência Artificial</span>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            As <strong>questões</strong> deste simulador foram geradas por LLMs (IA) com base na documentação da AWS.
                            Embora revisadas, podem conter imprecisões. Sempre consulte a documentação oficial para a "verdade absoluta".
                        </p>
                        <a
                            href="https://aws.amazon.com/certification/certified-cloud-practitioner/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-aws-light-blue hover:underline mt-1"
                        >
                            Ver Guia Oficial do Exame CLF-C02
                        </a>
                    </div>

                    <div className="text-sm text-text-tertiary space-y-2">
                        <p>© {new Date().getFullYear()} Pedro Henrique Simão Soares. Todos os direitos reservados.</p>
                        <p>Este projeto não é afiliado à Amazon Web Services (AWS).</p>
                    </div>

                    <div className="flex justify-center gap-4">
                        <a href="https://github.com/PedroHSSoares-Dev/aws-ccp-simulator" className="text-text-secondary hover:text-text-primary transition-colors">
                            GitHub
                        </a>
                        <a href="https://github.com/PedroHSSoares-Dev/aws-ccp-simulator/blob/main/LICENSE" className="text-text-secondary hover:text-text-primary transition-colors">
                            Licença MIT
                        </a>
                        <a href="https://github.com/PedroHSSoares-Dev/aws-ccp-simulator/issues" className="text-text-secondary hover:text-text-primary transition-colors">
                            Reportar Problema
                        </a>
                    </div>
                </div>
            </footer>

            {/* Modals */}
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
            <ConfirmationModal
                isOpen={!!pendingMode}
                onClose={() => setPendingMode(null)}
                onConfirm={confirmStartExam}
                title="Iniciar Exame?"
                description={pendingMode === 'official'
                    ? "O modo oficial tem 90 minutos e não pode ser pausado. Tem certeza que quer começar agora?"
                    : "O Quick Quiz são 20 questões rápidas. Deseja iniciar?"
                }
            />
        </div >
    );
};
