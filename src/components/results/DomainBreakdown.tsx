import React from 'react';
import { cn } from '../../lib/utils';
import { Progress } from '../ui/Progress';
import { Card } from '../ui/Card';
import type { DomainKey, DomainScores } from '../../types';
import { DOMAIN_INFO } from '../../types';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface DomainBreakdownProps {
    domainScores: DomainScores;
}

export const DomainBreakdown: React.FC<DomainBreakdownProps> = ({
    domainScores,
}) => {
    const domains: DomainKey[] = ['domain1', 'domain2', 'domain3', 'domain4'];

    const getScoreStatus = (percentage: number) => {
        if (percentage >= 80) return { status: 'excellent', icon: CheckCircle, color: 'text-success' };
        if (percentage >= 70) return { status: 'passing', icon: CheckCircle, color: 'text-warning' };
        if (percentage >= 50) return { status: 'needs-work', icon: AlertTriangle, color: 'text-warning' };
        return { status: 'weak', icon: XCircle, color: 'text-error' };
    };

    return (
        <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
                Domain Performance
            </h2>

            <div className="space-y-5">
                {domains.map((domainKey) => {
                    const score = domainScores[domainKey];
                    const info = DOMAIN_INFO[domainKey];
                    const { icon: StatusIcon, color } = getScoreStatus(score.percentage);

                    return (
                        <div key={domainKey}>
                            {/* Domain header */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: `var(--color-${info.color})` }}
                                    />
                                    <span className="font-medium text-text-primary text-sm">
                                        {info.name}
                                    </span>
                                    <span className="text-xs text-text-secondary">
                                        ({info.weight * 100}%)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusIcon className={cn('w-4 h-4', color)} />
                                    <span className="text-sm font-semibold text-text-primary">
                                        {score.correct}/{score.total}
                                    </span>
                                    <span className={cn('text-sm font-bold', color)}>
                                        {score.percentage}%
                                    </span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <Progress
                                value={score.percentage}
                                variant={domainKey as 'domain1' | 'domain2' | 'domain3' | 'domain4'}
                                size="md"
                            />
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-border">
                <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
                    <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-success" />
                        <span>≥80% Excellent</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-warning" />
                        <span>70-79% Passing</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                        <span>50-69% Needs Work</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-error" />
                        <span>&lt;50% Focus Area</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
