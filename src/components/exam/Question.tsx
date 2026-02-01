import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Check, Circle, Square, CheckSquare } from 'lucide-react';
import type { Question as QuestionType, QuestionOption, OptionId } from '../../types';

interface QuestionProps {
    question: QuestionType;
    selectedOptions: OptionId[];
    onSelectOption: (optionId: OptionId) => void;
    showExplanation?: boolean;
    isSubmitted?: boolean;
    focusedOptionIndex?: number;
}

export const Question: React.FC<QuestionProps> = ({
    question,
    selectedOptions,
    onSelectOption,
    showExplanation = false,
    isSubmitted = false,
    focusedOptionIndex = -1,
}) => {
    const isMultipleChoice = question.type === 'multiple-choice';
    const requiredSelections = question.correct.length;

    // Check if an option is correct (for showing after submission)
    const isOptionCorrect = (optionId: OptionId): boolean => {
        return question.correct.includes(optionId);
    };

    // Get option state for styling
    const getOptionState = (optionId: OptionId) => {
        const isSelected = selectedOptions.includes(optionId);
        const isCorrect = isOptionCorrect(optionId);

        if (isSubmitted) {
            if (isSelected && isCorrect) return 'correct-selected';
            if (isSelected && !isCorrect) return 'incorrect-selected';
            if (!isSelected && isCorrect) return 'correct-missed';
            return 'neutral';
        }

        return isSelected ? 'selected' : 'unselected';
    };

    const getOptionStyles = (state: string) => {
        switch (state) {
            case 'correct-selected':
                return {
                    card: 'border-success bg-success/10',
                    icon: 'text-success',
                };
            case 'incorrect-selected':
                return {
                    card: 'border-error bg-error/10',
                    icon: 'text-error',
                };
            case 'correct-missed':
                return {
                    card: 'border-success/50 bg-success/5',
                    icon: 'text-success/50',
                };
            case 'selected':
                return {
                    card: 'border-aws-orange bg-aws-orange/10',
                    icon: 'text-aws-orange',
                };
            default:
                return {
                    card: 'border-border hover:border-aws-orange/50 hover:bg-card-hover',
                    icon: 'text-text-secondary',
                };
        }
    };

    const handleOptionClick = (optionId: OptionId) => {
        if (isSubmitted) return;
        onSelectOption(optionId);
    };

    return (
        <div className="space-y-6">
            {/* Question type indicator */}
            <div className="flex items-center gap-2 text-sm text-text-secondary">
                {isMultipleChoice ? (
                    <>
                        <CheckSquare className="w-4 h-4" />
                        <span>Selecione {requiredSelections} opções</span>
                    </>
                ) : (
                    <>
                        <Circle className="w-4 h-4" />
                        <span>Selecione 1 opção</span>
                    </>
                )}
            </div>

            {/* Question text */}
            <div className="markdown-content text-lg leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {question.question}
                </ReactMarkdown>
            </div>

            {/* Table if present */}
            {question.table && (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                {question.table.headers.map((header, i) => (
                                    <th
                                        key={i}
                                        className="bg-card border border-border px-3 py-2 text-left font-semibold"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {question.table.rows.map((row, i) => (
                                <tr key={i}>
                                    {row.map((cell, j) => (
                                        <td key={j} className="border border-border px-3 py-2">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Answer options */}
            <div className="space-y-3">
                {question.options.map((option, index) => {
                    const state = getOptionState(option.id);
                    const styles = getOptionStyles(state);
                    const isSelected = selectedOptions.includes(option.id);
                    const isFocused = !isSubmitted && index === focusedOptionIndex;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleOptionClick(option.id)}
                            disabled={isSubmitted}
                            className={cn(
                                'w-full text-left p-4 rounded-xl border-2 transition-all duration-150',
                                'focus:outline-none focus:ring-2 focus:ring-aws-orange/50 focus:ring-offset-2',
                                !isSubmitted && 'cursor-pointer',
                                isSubmitted && 'cursor-default',
                                styles.card,
                                isSelected && !isSubmitted && 'animate-pulse-once',
                                isFocused && 'ring-2 ring-aws-orange ring-offset-2 ring-offset-background'
                            )}
                            aria-pressed={isSelected}
                            aria-label={`Option ${option.id}: ${option.text}`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Selection indicator */}
                                <div className={cn('flex-shrink-0 mt-0.5', styles.icon)}>
                                    {isMultipleChoice ? (
                                        isSelected ? (
                                            <CheckSquare className="w-5 h-5" />
                                        ) : (
                                            <Square className="w-5 h-5" />
                                        )
                                    ) : isSelected ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <Circle className="w-5 h-5" />
                                    )}
                                </div>

                                {/* Option letter */}
                                <span
                                    className={cn(
                                        'flex-shrink-0 w-7 h-7 flex items-center justify-center',
                                        'rounded-full font-semibold text-sm',
                                        isSelected
                                            ? 'bg-aws-orange text-white'
                                            : 'bg-card text-text-secondary'
                                    )}
                                >
                                    {option.id}
                                </span>

                                {/* Option text */}
                                <div className="flex-1 markdown-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {option.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Explanation (shown after submission or in review mode) */}
            {showExplanation && (
                <Card variant="outlined" className="border-aws-light-blue/30 bg-aws-light-blue/5">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-aws-light-blue text-white flex items-center justify-center text-xs font-bold">
                            i
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-aws-light-blue mb-2">
                                Explicação
                            </h4>
                            <div className="markdown-content text-text-secondary">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {question.explanation}
                                </ReactMarkdown>
                            </div>

                            {/* References */}
                            {question.references.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-border">
                                    <h5 className="text-sm font-medium text-text-secondary mb-2">
                                        Referências
                                    </h5>
                                    <ul className="space-y-1">
                                        {question.references.map((ref, i) => (
                                            <li key={i}>
                                                <a
                                                    href={ref}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-aws-light-blue hover:underline break-all"
                                                >
                                                    {ref}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};
