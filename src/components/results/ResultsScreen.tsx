import React, { useMemo } from 'react';
import { ScoreCard } from './ScoreCard';
import { DomainBreakdown } from './DomainBreakdown';
import { QuestionReviewList } from './QuestionReviewList';
import { AnswerSummary } from './AnswerSummary';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
    RotateCcw,
    BarChart3,
    Share2,
    Download,
    Home,
    ArrowLeft,
    Menu
} from 'lucide-react';
import type { ExamAttempt, Question } from '../../types';
import { isAnswerCorrect } from '../../lib/scoring';

interface ResultsScreenProps {
    attempt: ExamAttempt;
    questions: Question[];
    onNewExam: () => void;
    onGoHome: () => void;
    onViewDashboard?: () => void;
    isHistoryView?: boolean;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
    attempt,
    questions,
    onNewExam,
    onGoHome,
    onViewDashboard,
    isHistoryView = false,
}) => {
    // Build review items (all answers)
    const reviewItems = useMemo(() => {
        const questionsMap = new Map(questions.map((q) => [q.id, q]));

        return attempt.answers
            .map((answer) => ({
                question: questionsMap.get(answer.questionId)!,
                selected: answer.selected,
                isCorrect: !!answer.correct
            }))
            .filter((item) => item.question); // Filter out any missing questions
    }, [attempt.answers, questions]);

    // Share results (copy to clipboard)
    const handleShare = async () => {
        const text = `AWS CCP Exam Simulator Result 🎯
Score: ${attempt.score}/1000 (${attempt.passed ? 'PASSED ✅' : 'NOT PASSED ❌'})
Correct: ${attempt.correctAnswers}/${attempt.totalQuestions}
Date: ${new Date(attempt.date).toLocaleDateString()} `;

        try {
            await navigator.clipboard.writeText(text);
            alert('Results copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-aws-dark-blue text-white py-6">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-2xl font-bold">Resultado do Exame</h1>
                    <p className="text-white/70 mt-1">
                        {new Date(attempt.date).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Score Card */}
                <ScoreCard
                    score={attempt.score}
                    passed={attempt.passed}
                    correctAnswers={attempt.correctAnswers}
                    totalQuestions={attempt.totalQuestions}
                    duration={attempt.duration}
                />

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant={isHistoryView ? "secondary" : "primary"}
                        onClick={onNewExam}
                        leftIcon={isHistoryView ? <Menu className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                    >
                        {isHistoryView ? "Menu Principal" : "Novo Exame"}
                    </Button>
                    <Button
                        variant={isHistoryView ? "primary" : "secondary"}
                        onClick={onGoHome}
                        leftIcon={isHistoryView ? <ArrowLeft className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                    >
                        {isHistoryView ? "Voltar para Dashboard" : "Início"}
                    </Button>
                    {onViewDashboard && (
                        <Button
                            variant="outline"
                            onClick={onViewDashboard}
                            leftIcon={<BarChart3 className="w-4 h-4" />}
                        >
                            Ver Dashboard
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        onClick={handleShare}
                        leftIcon={<Share2 className="w-4 h-4" />}
                    >
                        Compartilhar
                    </Button>
                </div>

                {/* Answer Summary Grid */}
                <AnswerSummary attempt={attempt} />

                {/* Domain Breakdown */}
                <DomainBreakdown domainScores={attempt.domainScores} />

                {/* Review List (All Questions) */}
                <QuestionReviewList items={reviewItems} />

                {/* Study recommendations */}
                {attempt.passed ? (
                    <Card className="bg-success/5 border-success/30">
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">🎉</div>
                            <div>
                                <h3 className="text-lg font-semibold text-success">
                                    Parabéns!
                                </h3>
                                <p className="text-text-secondary mt-1">
                                    Você demonstrou forte compreensão dos conceitos de AWS Cloud
                                    Practitioner. Revise as áreas mais fracas acima e continue
                                    praticando para manter seu conhecimento.
                                </p>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className="bg-warning/5 border-warning/30">
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">💪</div>
                            <div>
                                <h3 className="text-lg font-semibold text-warning">
                                    Continue Praticando!
                                </h3>
                                <p className="text-text-secondary mt-1">
                                    Você está progredindo! Foque nos domínios onde obteve menor
                                    pontuação, revise as respostas erradas acima e tente novamente.
                                    Você consegue!
                                </p>
                            </div>
                        </div>
                    </Card>
                )}
            </main>
        </div>
    );
};
