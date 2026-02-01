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
    MessageSquare,
    Save,
    Cloud,
    Lock,
    Server,
    CreditCard,
    Scale // Icon for Weights
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useHistoryStore } from '../stores/historyStore';
import { useSettingsStore } from '../stores/settingsStore';
import type { WrongAnswersConfig } from './modals/WrongAnswersConfigModal';
import { WrongAnswersConfigModal } from './modals/WrongAnswersConfigModal';
import type { PracticeModeConfig } from './modals/PracticeModeConfigModal';
import { PracticeModeConfigModal } from './modals/PracticeModeConfigModal';
import { TermsModal } from './modals/TermsModal';
import { ConfirmationModal } from './modals/ConfirmationModal';
import { ThemeToggle } from './ui/ThemeToggle';
import { AudioToggle } from './ui/AudioToggle';

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
    // Get raw data from store
    const attempts = useHistoryStore((state) => state.attempts);

    // Settings for Terms
    const { termsAccepted, acceptTerms } = useSettingsStore();

    // State for modals
    const [showWrongAnswersModal, setShowWrongAnswersModal] = useState(false);
    const [showPracticeModeModal, setShowPracticeModeModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    // Confirmation State
    const [pendingMode, setPendingMode] = useState<'official' | 'quick' | null>(null);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

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

    const handleActionWithTerms = (action: () => void) => {
        if (!termsAccepted) {
            setPendingAction(() => action);
            setShowTermsModal(true);
        } else {
            action();
        }
    };

    const handleModeClick = (mode: 'official' | 'quick') => {
        handleActionWithTerms(() => setPendingMode(mode));
    };

    const confirmStartExam = () => {
        if (pendingMode) {
            onStartExam(pendingMode);
            setPendingMode(null);
        }
    };

    const handlePracticeClick = () => {
        handleActionWithTerms(() => setShowPracticeModeModal(true));
    };

    const handleWrongAnswersClick = () => {
        handleActionWithTerms(() => setShowWrongAnswersModal(true));
    };

    const handleAcceptTerms = () => {
        acceptTerms();
        setShowTermsModal(false);
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    };

    const domains = [
        {
            title: 'Cloud Concepts',
            percentage: '24%',
            icon: Cloud,
            color: 'text-aws-light-blue',
            bg: 'bg-aws-light-blue/10',
            desc: 'Conceitos de nuvem, benefícios AWS e computação básica.'
        },
        {
            title: 'Security & Compliance',
            percentage: '30%',
            icon: Lock,
            color: 'text-error',
            bg: 'bg-error/10',
            desc: 'Modelo de responsabilidade, segurança e gestão de acessos.'
        },
        {
            title: 'Cloud Technology',
            percentage: '34%',
            icon: Server,
            color: 'text-aws-orange',
            bg: 'bg-aws-orange/10',
            desc: 'Serviços principais: EC2, Lambda, S3, RDS, infraestrutura global.'
        },
        {
            title: 'Billing & Pricing',
            percentage: '12%',
            icon: CreditCard,
            color: 'text-success',
            bg: 'bg-success/10',
            desc: 'Modelos de cobrança, suporte e ferramentas de custo.'
        }
    ];

    // Scroll handler for anchor links
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-aws-orange/20">
            {/* Header with Nav */}
            <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-lg text-text-primary cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                        <span className="text-aws-orange">AWS</span>
                        <span>Simulator</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-border text-text-secondary ml-2 font-normal hidden sm:inline-block">v1.0 (Free)</span>
                    </div>

                    <div className="flex items-center gap-6 text-sm font-medium text-text-secondary">
                        <nav className="hidden md:flex gap-6 mr-2">
                            <button onClick={() => scrollToSection('modes')} className="hover:text-text-primary transition-colors">Modos</button>
                            <button onClick={() => scrollToSection('domains')} className="hover:text-text-primary transition-colors">Domínios</button>
                            <button onClick={() => scrollToSection('logic')} className="hover:text-text-primary transition-colors">Lógica</button>
                        </nav>

                        <div className="h-6 w-px bg-border hidden md:block"></div>

                        <a href="https://aws.amazon.com/certification/certified-cloud-practitioner/" target="_blank" rel="noopener noreferrer" className="hover:text-aws-orange transition-colors hidden sm:flex items-center gap-1">
                            Docs <span className="hidden lg:inline">Oficiais</span>
                        </a>

                        <div className="flex items-center gap-2">
                            <AudioToggle />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4">
                {/* Hero Section */}
                <div className="py-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aws-light-blue/10 text-aws-light-blue text-xs font-bold uppercase tracking-wide mb-6">
                        Cloud Practitioner CLF-C02
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary mb-6 max-w-4xl mx-auto">
                        Simulador Gratuito para <br className="hidden md:block" /> Certificação AWS
                    </h1>

                    <p className="text-lg text-text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
                        Uma ferramenta open-source para estudar sem distrações. <br />
                        <span className="text-success font-medium flex items-center justify-center gap-1 mt-2">
                            <Save className="w-4 h-4" />
                            Seu progresso fica salvo automaticamente no navegador.
                        </span>
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <Button
                            size="lg"
                            className="font-semibold shadow-lg shadow-aws-orange/20 px-8 w-full sm:w-auto"
                            onClick={() => handleModeClick('official')}
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Começar Simulado
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="bg-background w-full sm:w-auto"
                            onClick={onViewDashboard}
                        >
                            <BarChart2 className="w-4 h-4 mr-2" />
                            Meu Progresso
                        </Button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-text-secondary border-t border-border pt-8 max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            <span className="font-medium">1.200+ Questões</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
                            <Globe className="w-4 h-4 text-aws-light-blue" />
                            <span className="font-medium">4 Domínios</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
                            <Code className="w-4 h-4 text-text-tertiary" />
                            <span className="font-medium">Open Source</span>
                        </div>
                    </div>
                </div>

                {/* Exam Modes (MOVED TO TOP) */}
                <section id="modes" className="py-12 border-t border-border scroll-mt-20">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-text-primary">Modos de Estudo</h2>
                        <p className="text-text-secondary mt-1">Escolha como você quer praticar hoje</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Official Mode */}
                        <Card
                            variant="interactive"
                            className="p-5 flex flex-col h-full hover:border-aws-orange/50 transition-colors text-left"
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
                            className="p-5 flex flex-col h-full hover:border-aws-light-blue/50 transition-colors text-left"
                            onClick={handlePracticeClick}
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
                            className="p-5 flex flex-col h-full hover:border-success/50 transition-colors text-left"
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
                            className="p-5 flex flex-col h-full hover:border-error/50 transition-colors text-left"
                            onClick={handleWrongAnswersClick}
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
                </section>

                {/* Domains Section */}
                <section id="domains" className="py-12 border-t border-border scroll-mt-20">
                    <div className="space-y-4 mb-8">
                        <h2 className="text-2xl font-bold text-text-primary text-center">Domínios do Exame</h2>
                        <p className="text-text-secondary text-center max-w-2xl mx-auto">
                            O exame CLF-C02 cobre quatro áreas principais. O simulador segue exatamente essa distribuição.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {domains.map((domain, i) => (
                            <div key={i} className="bg-card border border-border rounded-xl p-5 hover:border-aws-orange/30 transition-colors flex flex-col items-start text-left">
                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4", domain.bg, domain.color)}>
                                    <domain.icon className="w-5 h-5" />
                                </div>
                                <div className="flex items-baseline justify-between w-full mb-1">
                                    <h3 className="font-semibold text-text-primary">{domain.title}</h3>
                                    <span className="text-xs font-bold text-text-tertiary bg-background px-2 py-0.5 rounded border border-border">
                                        {domain.percentage}
                                    </span>
                                </div>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    {domain.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Technical Features / Logic Section */}
                <section id="logic" className="py-12 border-t border-border scroll-mt-20">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aws-orange/10 text-aws-orange text-xs font-bold uppercase tracking-wide mb-4">
                                Por baixo do capô
                            </div>
                            <h2 className="text-3xl font-bold text-text-primary mb-6">
                                Algoritmos que trabalham <br /> a seu favor
                            </h2>
                            <p className="text-text-secondary mb-6 leading-relaxed">
                                Diferente de PDFs estáticos ou plataformas genéricas, desenvolvemos lógicas específicas para acelerar sua aprovação, seguindo estritamente o guia oficial da AWS.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                                        <Scale className="w-5 h-5 text-text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-text-primary mb-1">Pesos Oficiais (Weighted Scoring)</h3>
                                        <p className="text-sm text-text-secondary">
                                            O algoritmo de seleção de questões respeita a proporção exata do exame (ex: 34% Tecnologia, 24% Conceitos). Você treina como se fosse a prova real.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                                        <Shield className="w-5 h-5 text-aws-orange" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-text-primary mb-1">Sistema Anti-Repetição</h3>
                                        <p className="text-sm text-text-secondary">
                                            O simulador "lembra" das questões que caíram nas suas últimas 3 provas e as bloqueia. Você é forçado a ver conteúdo novo a cada tentativa.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                                        <BarChart2 className="w-5 h-5 text-aws-light-blue" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-text-primary mb-1">Análise de Gaps</h3>
                                        <p className="text-sm text-text-secondary">
                                            Identificamos não só a nota, mas quais domínios específicos (ex: Billing) estão derrubando sua média, sugerindo onde focar.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative hidden md:block">
                            <div className="absolute inset-0 bg-gradient-to-r from-aws-orange/20 to-aws-light-blue/20 blur-3xl rounded-full opacity-30" />
                            <div className="relative bg-card border border-border rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                                    <span className="text-sm font-mono text-text-secondary">logic_preview.tsx</span>
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-error/50" />
                                        <div className="w-3 h-3 rounded-full bg-warning/50" />
                                        <div className="w-3 h-3 rounded-full bg-success/50" />
                                    </div>
                                </div>
                                <div className="space-y-3 font-mono text-xs md:text-sm">
                                    <div className="flex">
                                        <span className="text-text-tertiary w-8">01</span>
                                        <span className="text-aws-orange">const</span>
                                        <span className="text-text-primary ml-2">generateExam</span>
                                        <span className="text-text-secondary mx-1">=</span>
                                        <span className="text-text-tertiary">()</span>
                                        <span className="text-aws-orange mx-2">=&gt;</span>
                                        <span className="text-text-tertiary">{`{`}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-text-tertiary w-8">02</span>
                                        <span className="text-text-secondary ml-4">// 1. Weighted Distribution Strategy</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-text-tertiary w-8">03</span>
                                        <span className="text-aws-orange ml-4">const</span>
                                        <span className="text-text-primary ml-2">distribution</span>
                                        <span className="text-text-secondary mx-1">=</span>
                                        <span className="text-text-tertiary">{`{`}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-text-tertiary w-8 opacity-50">04</span>
                                        <span className="text-text-primary ml-8">'concepts': </span>
                                        <span className="text-success">0.24</span>,
                                    </div>
                                    <div className="flex">
                                        <span className="text-text-tertiary w-8 opacity-50">05</span>
                                        <span className="text-text-primary ml-8">'security': </span>
                                        <span className="text-success">0.30</span>,
                                    </div>
                                    <div className="flex">
                                        <span className="text-text-tertiary w-8 opacity-50">06</span>
                                        <span className="text-text-primary ml-8">'tech': </span>
                                        <span className="text-success">0.34</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-text-tertiary w-8">07</span>
                                        <span className="text-text-tertiary ml-4">{`}`}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-text-tertiary w-8">08</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-text-tertiary w-8">09</span>
                                        <span className="text-text-secondary ml-4">// 2. Anti-Repetition Filter</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-text-tertiary w-8">10</span>
                                        <span className="text-aws-orange ml-4">const</span>
                                        <span className="text-text-primary ml-2">blockedIds</span>
                                        <span className="text-text-secondary mx-1">=</span>
                                        <span className="text-text-primary">history</span>
                                        <span className="text-aws-light-blue">.getLast</span>
                                        <span className="text-text-tertiary">(3);</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-text-tertiary w-8">11</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-text-tertiary w-8">12</span>
                                        <span className="text-aws-orange ml-4">return</span>
                                        <span className="text-aws-light-blue ml-2">smartShuffle</span>
                                        <span className="text-text-tertiary">(questions, distribution);</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-text-tertiary w-8">13</span>
                                        <span className="text-text-tertiary">{`}`}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bug Report / Contribute Section */}
                <section className="py-16 text-center border-t border-border">
                    <div className="max-w-2xl mx-auto bg-card p-8 rounded-2xl border border-border">
                        <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                            <MessageSquare className="w-6 h-6 text-text-secondary" />
                        </div>
                        <h2 className="text-xl font-bold mb-3">Encontrou um bug ou tem uma sugestão?</h2>
                        <p className="text-text-secondary mb-6">
                            Este projeto é colaborativo (Source Available). Contribuições via **Pull Requests** são bem-vindas, seja para corrigir questões ou adicionar funcionalidades.
                        </p>
                        <a
                            href="https://github.com/PedroHSSoares-Dev/aws-ccp-simulator/issues/new"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline">
                                <Github className="w-4 h-4 mr-2" />
                                Abrir Issue no GitHub
                            </Button>
                        </a>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card py-8 mt-auto">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
                    <div className="flex items-center justify-center gap-2 text-warning font-medium text-sm bg-warning/5 py-2 rounded-lg max-w-lg mx-auto border border-warning/20">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Aviso: Questões geradas por IA. Consulte a documentação oficial.</span>
                    </div>

                    <div className="flex justify-center gap-6 text-sm font-medium">
                        <a href="https://github.com/PedroHSSoares-Dev/aws-ccp-simulator" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
                            <Github className="w-4 h-4" /> GitHub
                        </a>
                        <a href="https://github.com/PedroHSSoares-Dev/aws-ccp-simulator/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
                            <Scale className="w-4 h-4" /> Uso Pessoal (Não Comercial)
                        </a>
                    </div>

                    <div className="text-sm text-text-tertiary border-t border-border/50 pt-6">
                        <p>© {new Date().getFullYear()} Pedro Henrique Simão Soares. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>

            {/* Modals */}
            <TermsModal
                isOpen={showTermsModal}
                onAccept={handleAcceptTerms}
                onDecline={() => {
                    setShowTermsModal(false);
                    setPendingAction(null);
                    setPendingMode(null);
                }}
            />
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
        </div>
    );
};
