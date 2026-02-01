import React, { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { ChevronDown, ChevronRight, AlertCircle, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Question, DomainKey } from '../../types';
import { DOMAIN_INFO } from '../../types';

interface MissedStat {
    questionId: string;
    count: number;
    domain: DomainKey;
}

interface TopMissedQuestionsProps {
    stats: MissedStat[];
    questions: Question[];
    selectedDomain: DomainKey | 'all';
    onDomainSelect: (domain: DomainKey | 'all') => void;
}

export const TopMissedQuestions: React.FC<TopMissedQuestionsProps> = ({
    stats,
    questions,
    selectedDomain,
    onDomainSelect,
}) => {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpanded = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const questionsMap = useMemo(() => {
        return new Map(questions.map(q => [q.id, q]));
    }, [questions]);

    const filteredStats = useMemo(() => {
        if (selectedDomain === 'all') return stats;
        return stats.filter(s => s.domain === selectedDomain);
    }, [stats, selectedDomain]);

    if (stats.length === 0) {
        return null;
    }

    return (
        <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-aws-orange" />
                    <h3 className="text-lg font-semibold text-text-primary">
                        Questões Mais Erradas
                    </h3>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
                <button
                    onClick={() => onDomainSelect('all')}
                    className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                        selectedDomain === 'all'
                            ? "bg-text-primary text-background"
                            : "bg-card-hover text-text-secondary hover:bg-border"
                    )}
                >
                    Todas
                </button>
                {Object.entries(DOMAIN_INFO).map(([key, info]) => (
                    <button
                        key={key}
                        onClick={() => onDomainSelect(key as DomainKey)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                            selectedDomain === key
                                ? `bg-aws-light-blue text-white`
                                : "bg-card-hover text-text-secondary hover:bg-border"
                        )}
                        style={selectedDomain === key ? { backgroundColor: `var(--color-${info.color})` } : {}}
                    >
                        {info.shortName}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[400px] scrollbar-thin">
                {filteredStats.map(({ questionId, count, domain }) => {
                    const question = questionsMap.get(questionId);
                    if (!question) return null;

                    const isExpanded = expandedIds.has(questionId);
                    const domainInfo = DOMAIN_INFO[domain];

                    return (
                        <div key={questionId} className="border border-border rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleExpanded(questionId)}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 text-left transition-colors",
                                    "hover:bg-card-hover"
                                )}
                            >
                                <div className="flex-1 min-w-0 pr-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-error bg-error/10 px-2 py-0.5 rounded">
                                            {count}x erros
                                        </span>
                                        <span
                                            className="text-xs font-medium px-2 py-0.5 rounded bg-opacity-20"
                                            style={{ color: `var(--color-${domainInfo.color})`, backgroundColor: `var(--color-${domainInfo.color})20` }}
                                        >
                                            {domainInfo.shortName}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-primary line-clamp-1 font-medium">
                                        {question.question.replace(/[#*`]/g, '')}
                                    </p>
                                </div>
                                {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-text-secondary flex-shrink-0" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-text-secondary flex-shrink-0" />
                                )}
                            </button>

                            {isExpanded && (
                                <div className="p-4 bg-card-hover border-t border-border text-sm">
                                    <div className="markdown-content mb-3 text-text-secondary">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {question.question}
                                        </ReactMarkdown>
                                    </div>

                                    <div className="bg-background rounded p-3 border border-border">
                                        <div className="flex items-center gap-2 mb-2 text-aws-light-blue font-medium">
                                            <BookOpen className="w-4 h-4" />
                                            Explicação
                                        </div>
                                        <div className="markdown-content text-text-secondary text-xs">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {question.explanation}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredStats.length === 0 && (
                    <div className="text-center py-8 text-text-secondary text-sm">
                        Nenhuma questão encontrada para este filtro.
                    </div>
                )}
            </div>
        </Card>
    );
};
