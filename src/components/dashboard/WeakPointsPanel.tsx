// ============================================================================
// Weak Points Panel - Study recommendations based on performance
// ============================================================================

import { Card } from '../ui/Card';
import {
    AlertTriangle,
    BookOpen,
    Target,
    ChevronRight,
    Lightbulb,
} from 'lucide-react';
import { cn } from '../../lib/utils';

import type { DomainKey } from '../../types';

interface WeakPoint {
    domain: string;
    rawDomain: DomainKey;
    topic: string;
    accuracy: number;
    questionsWrong: number;
    maarekSection?: string;
}

interface WeakPointsPanelProps {
    weakPoints: WeakPoint[];
    onPointClick?: (domain: DomainKey) => void;
}

const getUrgencyColor = (accuracy: number): string => {
    if (accuracy < 40) return 'border-error bg-error/5';
    if (accuracy < 60) return 'border-warning bg-warning/5';
    return 'border-text-secondary/30 bg-card';
};

const getUrgencyLabel = (accuracy: number): string => {
    if (accuracy < 40) return 'Crítico';
    if (accuracy < 60) return 'Atenção';
    return 'Revisar';
};

export const WeakPointsPanel: React.FC<WeakPointsPanelProps> = ({ weakPoints, onPointClick }) => {
    if (weakPoints.length === 0) {
        return (
            <Card className="h-full flex items-center justify-center min-h-[300px]">
                <div className="text-center text-text-secondary">
                    <p className="text-lg font-medium">Sem pontos fracos identificados</p>
                    <p className="text-sm">Seu desempenho está equilibrado!</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-semibold text-text-primary">
                    Pontos para Estudar
                </h3>
            </div>

            <div className="space-y-3">
                {weakPoints.map((point, index) => (
                    <div
                        key={index}
                        onClick={() => onPointClick?.(point.rawDomain)}
                        className={cn(
                            'p-3 rounded-lg border-l-4 transition-colors',
                            'hover:bg-card-hover cursor-pointer',
                            getUrgencyColor(point.accuracy)
                        )}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn(
                                        'text-xs font-bold px-2 py-0.5 rounded',
                                        point.accuracy < 40
                                            ? 'bg-error text-white'
                                            : point.accuracy < 60
                                                ? 'bg-warning text-white'
                                                : 'bg-text-secondary/20 text-text-secondary'
                                    )}>
                                        {getUrgencyLabel(point.accuracy)}
                                    </span>
                                    <span className="text-xs text-text-secondary">
                                        {point.accuracy}% de acerto
                                    </span>
                                </div>
                                <p className="font-medium text-text-primary truncate">
                                    {point.topic}
                                </p>
                                <p className="text-sm text-text-secondary">
                                    {point.domain} • {point.questionsWrong} erros
                                </p>
                                {point.maarekSection && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-aws-light-blue">
                                        <BookOpen className="w-3 h-3" />
                                        <span>{point.maarekSection}</span>
                                    </div>
                                )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-text-secondary flex-shrink-0" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-text-secondary text-center">
                    💡 Dica: Foque nos tópicos marcados como "Crítico" primeiro
                </p>
            </div>
        </Card>
    );
};
