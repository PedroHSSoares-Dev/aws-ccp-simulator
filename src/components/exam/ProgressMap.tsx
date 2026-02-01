import React from 'react';
import { cn } from '../../lib/utils';
import { Check, Flag } from 'lucide-react';

interface ProgressMapProps {
    totalQuestions: number;
    currentIndex: number;
    answeredIds: Set<string> | string[];
    markedIds: Set<string> | string[];
    questionIds: string[];
    onQuestionClick: (index: number) => void;
}

export const ProgressMap: React.FC<ProgressMapProps> = ({
    totalQuestions,
    currentIndex,
    answeredIds,
    markedIds,
    questionIds,
    onQuestionClick,
}) => {
    // Convert to Sets for consistent lookup
    const answeredSet = answeredIds instanceof Set
        ? answeredIds
        : new Set(answeredIds);
    const markedSet = markedIds instanceof Set
        ? markedIds
        : new Set(markedIds);

    const getQuestionStatus = (index: number) => {
        const questionId = questionIds[index];
        const isCurrent = index === currentIndex;
        const isAnswered = answeredSet.has(questionId);
        const isMarked = markedSet.has(questionId);

        return { isCurrent, isAnswered, isMarked };
    };

    const getButtonStyle = (index: number) => {
        const { isCurrent, isAnswered, isMarked } = getQuestionStatus(index);

        if (isCurrent) {
            return {
                bg: 'bg-aws-orange',
                border: 'border-aws-orange',
                text: 'text-white',
                ring: 'ring-2 ring-aws-orange/50 ring-offset-2',
            };
        }

        if (isMarked) {
            return {
                bg: isAnswered ? 'bg-warning/80' : 'bg-warning/40',
                border: 'border-warning',
                text: 'text-aws-dark-blue',
                ring: '',
            };
        }

        if (isAnswered) {
            return {
                bg: 'bg-success/80',
                border: 'border-success',
                text: 'text-white',
                ring: '',
            };
        }

        return {
            bg: 'bg-card hover:bg-card-hover',
            border: 'border-border',
            text: 'text-text-secondary',
            ring: '',
        };
    };

    return (
        <div className="w-full">
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4 text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span>Respondida</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span>Marcada</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-card border border-border" />
                    <span>Pendente</span>
                </div>
            </div>

            {/* Question grid */}
            <div
                className="grid grid-cols-10 gap-1.5"
                role="navigation"
                aria-label="Question navigation"
            >
                {Array.from({ length: totalQuestions }, (_, index) => {
                    const { isAnswered, isMarked } = getQuestionStatus(index);
                    const style = getButtonStyle(index);

                    return (
                        <button
                            key={index}
                            onClick={() => onQuestionClick(index)}
                            className={cn(
                                'relative aspect-square flex items-center justify-center',
                                'text-xs font-medium rounded-md border',
                                'transition-all duration-150 ease-out',
                                'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-aws-orange/50',
                                style.bg,
                                style.border,
                                style.text,
                                style.ring
                            )}
                            aria-label={`Question ${index + 1}${isAnswered ? ', answered' : ''}${isMarked ? ', marked for review' : ''}`}
                            aria-current={index === currentIndex ? 'true' : undefined}
                        >
                            {/* Question number or icon */}
                            {isMarked ? (
                                <Flag className="w-3 h-3" />
                            ) : isAnswered ? (
                                <Check className="w-3 h-3" />
                            ) : (
                                <span>{index + 1}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-4 flex justify-between text-sm text-text-secondary">
                <span>
                    Respondidas: {answeredSet.size}/{totalQuestions}
                </span>
                <span>
                    Marcadas: {markedSet.size}
                </span>
            </div>
        </div>
    );
};
