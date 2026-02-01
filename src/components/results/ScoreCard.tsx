import React from 'react';
import { cn } from '../../lib/utils';
import { CircularProgress } from '../ui/Progress';
import { Trophy, XCircle, Target, TrendingUp, Clock } from 'lucide-react';
import { formatDuration } from '../../lib/utils';

interface ScoreCardProps {
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    duration: number;
    targetScore?: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
    score,
    passed,
    correctAnswers,
    totalQuestions,
    duration,
    targetScore = 700,
}) => {
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const metTarget = score >= targetScore;

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl p-6 md:p-8',
                'border-2',
                passed
                    ? 'bg-gradient-to-br from-success/10 to-success/5 border-success/30'
                    : 'bg-gradient-to-br from-error/10 to-error/5 border-error/30'
            )}
        >
            {/* Background decoration */}
            <div
                className={cn(
                    'absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20',
                    passed ? 'bg-success' : 'bg-error'
                )}
            />

            <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8">
                {/* Score circle */}
                <div className="relative">
                    <CircularProgress
                        value={score}
                        max={1000}
                        size={160}
                        strokeWidth={12}
                        variant={passed ? 'success' : 'danger'}
                        showValue={false}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-text-primary">
                            {score}
                        </span>
                        <span className="text-sm text-text-secondary">/1000</span>
                    </div>
                </div>

                {/* Result info */}
                <div className="flex-1 text-center md:text-left">
                    {/* Status badge */}
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                        <div
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-full font-semibold',
                                passed
                                    ? 'bg-success text-white'
                                    : 'bg-error text-white'
                            )}
                        >
                            {passed ? (
                                <Trophy className="w-5 h-5" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                            <span>{passed ? 'PASSED' : 'NOT PASSED'}</span>
                        </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
                                <Target className="w-4 h-4" />
                            </div>
                            <span className="block text-lg font-bold text-text-primary">
                                {correctAnswers}/{totalQuestions}
                            </span>
                            <span className="text-xs text-text-secondary">
                                Correct ({percentage}%)
                            </span>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
                                <Clock className="w-4 h-4" />
                            </div>
                            <span className="block text-lg font-bold text-text-primary">
                                {formatDuration(duration)}
                            </span>
                            <span className="text-xs text-text-secondary">Duration</span>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <span
                                className={cn(
                                    'block text-lg font-bold',
                                    metTarget ? 'text-success' : 'text-warning'
                                )}
                            >
                                {metTarget ? '✓' : `+${targetScore - score}`}
                            </span>
                            <span className="text-xs text-text-secondary">
                                Target: {targetScore}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
