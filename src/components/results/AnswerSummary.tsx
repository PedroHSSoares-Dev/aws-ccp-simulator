import React from 'react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Check, X } from 'lucide-react';
import type { ExamAttempt } from '../../types';

interface AnswerSummaryProps {
    attempt: ExamAttempt;
}

export const AnswerSummary: React.FC<AnswerSummaryProps> = ({ attempt }) => {
    const correctCount = attempt.answers.filter(a => a.correct).length;
    const wrongCount = attempt.answers.filter(a => !a.correct).length;

    return (
        <Card>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">
                    Resumo das Respostas
                </h2>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-success/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-success" />
                        </div>
                        <span className="text-success font-medium">{correctCount} certas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-error/20 flex items-center justify-center">
                            <X className="w-3 h-3 text-error" />
                        </div>
                        <span className="text-error font-medium">{wrongCount} erradas</span>
                    </div>
                </div>
            </div>

            {/* Question Grid */}
            <div className="flex flex-wrap gap-2">
                {attempt.answers.map((answer, index) => (
                    <div
                        key={answer.questionId}
                        className={cn(
                            'w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm transition-all',
                            answer.correct
                                ? 'bg-success/15 text-success border border-success/30 hover:bg-success/25'
                                : 'bg-error/15 text-error border border-error/30 hover:bg-error/25'
                        )}
                        title={`Questão ${index + 1}: ${answer.correct ? 'Correta' : 'Errada'}`}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>
        </Card>
    );
};
