import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import { ChevronDown, ChevronRight, XCircle, Check } from 'lucide-react';
import type { Question, OptionId, DomainId, DomainKey } from '../../types';
import { DOMAIN_INFO } from '../../types';

export interface ReviewItem {
    question: Question;
    selected: OptionId[];
    isCorrect: boolean;
}

interface QuestionReviewListProps {
    items: ReviewItem[];
}

export const QuestionReviewList: React.FC<QuestionReviewListProps> = ({
    items,
}) => {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpanded = (questionId: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(questionId)) {
                next.delete(questionId);
            } else {
                next.add(questionId);
            }
            return next;
        });
    };

    const expandAll = () => {
        setExpandedIds(new Set(items.map((item) => item.question.id)));
    };

    const collapseAll = () => {
        setExpandedIds(new Set());
    };

    const getDomainKey = (domainId: DomainId): DomainKey => {
        const mapping: Record<DomainId, DomainKey> = {
            'domain1-cloud-concepts': 'domain1',
            'domain2-security': 'domain2',
            'domain3-technology': 'domain3',
            'domain4-billing': 'domain4',
        };
        return mapping[domainId];
    };

    if (items.length === 0) {
        return null;
    }

    return (
        <Card padding="none">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">
                    Explicações ({items.length})
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={expandAll}
                        className="text-sm text-aws-light-blue hover:underline"
                    >
                        Expandir Todas
                    </button>
                    <span className="text-text-secondary">|</span>
                    <button
                        onClick={collapseAll}
                        className="text-sm text-aws-light-blue hover:underline"
                    >
                        Recolher Todas
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-border">
                {items.map(({ question, selected, isCorrect }, index) => {
                    const isExpanded = expandedIds.has(question.id);
                    const domainInfo = DOMAIN_INFO[getDomainKey(question.domain)];

                    return (
                        <div key={question.id}>
                            {/* Question header (clickable) */}
                            <button
                                onClick={() => toggleExpanded(question.id)}
                                className={cn(
                                    'w-full flex items-start gap-3 p-4 text-left',
                                    'hover:bg-card-hover transition-colors'
                                )}
                                aria-expanded={isExpanded}
                            >
                                {/* Expand/collapse icon */}
                                <div className="flex-shrink-0 mt-1 text-text-secondary">
                                    {isExpanded ? (
                                        <ChevronDown className="w-5 h-5" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5" />
                                    )}
                                </div>

                                {/* Question number - Green if correct, Red if wrong */}
                                <div className={cn(
                                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
                                    isCorrect
                                        ? "bg-success/15 text-success"
                                        : "bg-error/10 text-error"
                                )}>
                                    {index + 1}
                                </div>

                                {/* Question text preview */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{
                                                backgroundColor: `var(--color-${domainInfo.color})20`,
                                                color: `var(--color-${domainInfo.color})`,
                                            }}
                                        >
                                            {domainInfo.shortName}
                                        </span>
                                        <span className="text-xs text-text-secondary">
                                            {question.subdomain.replace(/-/g, ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-primary line-clamp-2">
                                        {question.question.replace(/[#*`]/g, '').slice(0, 150)}...
                                    </p>
                                </div>
                            </button>

                            {/* Expanded content */}
                            {isExpanded && (
                                <div className="px-4 pb-6 pt-2 bg-card/50">
                                    {/* Full question */}
                                    <div className="markdown-content mb-4 text-sm">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {question.question}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Options with highlighting */}
                                    <div className="space-y-2 mb-4">
                                        {question.options.map((option) => {
                                            const isSelected = selected.includes(option.id);
                                            const isOptionCorrect = question.correct.includes(option.id);

                                            return (
                                                <div
                                                    key={option.id}
                                                    className={cn(
                                                        'flex items-start gap-2 p-3 rounded-lg text-sm',
                                                        isOptionCorrect && 'bg-success/10 border border-success/30',
                                                        isSelected && !isOptionCorrect && 'bg-error/10 border border-error/30',
                                                        !isOptionCorrect && !isSelected && 'bg-card border border-border'
                                                    )}
                                                >
                                                    {/* Status icon */}
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {isOptionCorrect ? (
                                                            <Check className="w-4 h-4 text-success" />
                                                        ) : isSelected ? (
                                                            <XCircle className="w-4 h-4 text-error" />
                                                        ) : (
                                                            <div className="w-4 h-4" />
                                                        )}
                                                    </div>

                                                    {/* Option ID */}
                                                    <span
                                                        className={cn(
                                                            'flex-shrink-0 font-semibold',
                                                            isOptionCorrect && 'text-success',
                                                            isSelected && !isOptionCorrect && 'text-error'
                                                        )}
                                                    >
                                                        {option.id}.
                                                    </span>

                                                    {/* Option text */}
                                                    <div className="flex-1 markdown-content">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {option.text}
                                                        </ReactMarkdown>
                                                    </div>

                                                    {/* Labels */}
                                                    <div className="flex-shrink-0 flex gap-1">
                                                        {isOptionCorrect && (
                                                            <span className="text-xs px-1.5 py-0.5 bg-success/20 text-success rounded">
                                                                Correta
                                                            </span>
                                                        )}
                                                        {isSelected && !isOptionCorrect && (
                                                            <span className="text-xs px-1.5 py-0.5 bg-error/20 text-error rounded">
                                                                Sua Resposta
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Explanation */}
                                    <div className="bg-aws-light-blue/5 border border-aws-light-blue/20 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-aws-light-blue mb-2">
                                            Explicação
                                        </h4>
                                        <div className="markdown-content text-sm text-text-secondary">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {question.explanation}
                                            </ReactMarkdown>
                                        </div>

                                        {/* References */}
                                        {question.references.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-aws-light-blue/20">
                                                <h5 className="text-xs font-medium text-text-secondary mb-1">
                                                    Referências
                                                </h5>
                                                <ul className="space-y-0.5">
                                                    {question.references.map((ref, i) => (
                                                        <li key={i}>
                                                            <a
                                                                href={ref}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-aws-light-blue hover:underline"
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
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};
