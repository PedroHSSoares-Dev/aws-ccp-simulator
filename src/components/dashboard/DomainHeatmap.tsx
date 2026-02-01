// ============================================================================
// Domain Heatmap - Performance visualization by domain
// ============================================================================

import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import { DOMAIN_INFO } from '../../types';
import type { DomainKey } from '../../types';
import {
    Cloud,
    Shield,
    Server,
    CreditCard,
    TrendingUp,
    TrendingDown,
    Minus,
} from 'lucide-react';

interface DomainPerformance {
    domain: DomainKey;
    correct: number;
    total: number;
    percentage: number;
}

interface DomainHeatmapProps {
    domainPerformance: DomainPerformance[];
    onDomainClick?: (domain: DomainKey) => void;
}

const domainIcons: Record<DomainKey, React.ComponentType<any>> = {
    domain1: Cloud,
    domain2: Shield,
    domain3: Server,
    domain4: CreditCard,
};

const getPerformanceColor = (percentage: number): string => {
    if (percentage > 75) return 'bg-success/20 border-success text-success';
    if (percentage > 45) return 'bg-warning/20 border-warning text-warning';
    return 'bg-error/20 border-error text-error';
};

const getPerformanceLabel = (percentage: number): string => {
    if (percentage > 75) return 'Excelente';
    if (percentage > 45) return 'Regular';
    return 'Precisa Melhorar';
};

const getTrendIcon = (percentage: number) => {
    if (percentage >= 80) return TrendingUp;
    if (percentage >= 50) return Minus;
    return TrendingDown;
};

export const DomainHeatmap: React.FC<DomainHeatmapProps> = ({ domainPerformance, onDomainClick }) => {
    if (domainPerformance.length === 0) {
        // ... empty state ...
        return (
            <Card className="h-full flex items-center justify-center">
                <div className="text-center text-text-secondary">
                    <p className="text-lg font-medium">Sem dados de domínio</p>
                    <p className="text-sm">Complete uma prova para ver seu desempenho</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
                Desempenho por Domínio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {domainPerformance.map((perf) => {
                    const info = DOMAIN_INFO[perf.domain];
                    const Icon = domainIcons[perf.domain];
                    const TrendIcon = getTrendIcon(perf.percentage);
                    const colorClasses = getPerformanceColor(perf.percentage);
                    const label = getPerformanceLabel(perf.percentage);

                    return (
                        <div
                            key={perf.domain}
                            onClick={() => onDomainClick?.(perf.domain)}
                            title="Clique para filtrar as questões erradas abaixo"
                            className={cn(
                                'p-4 rounded-xl border-2 transition-all duration-200',
                                'hover:scale-[1.02] cursor-pointer',
                                colorClasses
                            )}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium text-sm">
                                        {info.shortName}
                                    </span>
                                </div>
                                <TrendIcon className="w-4 h-4" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">
                                        {perf.percentage}%
                                    </span>
                                    <span className="text-xs opacity-75">
                                        ({perf.correct}/{perf.total})
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="h-2 rounded-full bg-background/50 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-current opacity-50 transition-all duration-500"
                                        style={{ width: `${perf.percentage}%` }}
                                    />
                                </div>

                                <p className="text-xs font-medium opacity-75">
                                    {label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 text-xs text-center text-text-secondary">
                Clique em um domínio para filtrar as questões mais erradas abaixo
            </div>
        </Card>
    );
};
