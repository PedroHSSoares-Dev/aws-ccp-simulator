
import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { useHistoryStore } from '../../stores/historyStore';
import type { DomainKey, Question } from '../../types';
import { DOMAIN_INFO } from '../../types';
import { ChevronDown, ChevronRight, BookOpen, AlertCircle, ArrowUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../ui/Button';

interface WeakPointsModalProps {
    isOpen: boolean;
    onClose: () => void;
    domain: DomainKey | null;
    questions: Question[];
}

export const WeakPointsModal: React.FC<WeakPointsModalProps> = ({
    isOpen,
    onClose,
    domain,
    questions,
}) => {
    const getMissedQuestionsByDomain = useHistoryStore(state => state.getMissedQuestionsByDomain);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

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

    const missedQuestions = useMemo(() => {
        if (!domain) return [];
        return getMissedQuestionsByDomain(domain);
    }, [domain, getMissedQuestionsByDomain]);

    const sortedQuestions = useMemo(() => {
        return [...missedQuestions].sort((a, b) => {
            if (sortOrder === 'desc') return b.count - a.count;
            return a.count - b.count;
        });
    }, [missedQuestions, sortOrder]);

    const domainInfo = domain ? DOMAIN_INFO[domain] : null;

    if (!domain || !domainInfo) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Pontos Fracos: ${domainInfo.name}`}
            className="max-w-3xl"
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-text-secondary">
                        Você errou {sortedQuestions.length} questões diferentes neste domínio.
                    </p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="gap-2 text-xs"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        {sortOrder === 'desc' ? 'Mais erradas primeiro' : 'Menos erradas primeiro'}
                    </Button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                    {sortedQuestions.map(({ questionId, count }) => {
                        const question = questionsMap.get(questionId);
                        if (!question) return null;
                        const isExpanded = expandedIds.has(questionId);

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
                                            <span className="text-xs text-text-secondary font-mono">
                                                ID: {questionId.slice(0, 8)}
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

                    {sortedQuestions.length === 0 && (
                        <div className="text-center py-12 text-text-secondary">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Nenhuma questão errada encontrada neste domínio.</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
