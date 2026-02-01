// ============================================================================
// Stats Cards - Summary statistics for the dashboard
// ============================================================================

import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import {
    ClipboardList,
    Trophy,
    Target,
    TrendingUp,
    type LucideIcon
} from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color: 'orange' | 'green' | 'blue' | 'purple';
}

const colorClasses = {
    orange: {
        bg: 'bg-aws-orange/10',
        text: 'text-aws-orange',
        icon: 'bg-aws-orange/20',
    },
    green: {
        bg: 'bg-success/10',
        text: 'text-success',
        icon: 'bg-success/20',
    },
    blue: {
        bg: 'bg-aws-light-blue/10',
        text: 'text-aws-light-blue',
        icon: 'bg-aws-light-blue/20',
    },
    purple: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-500',
        icon: 'bg-purple-500/20',
    },
};

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color
}) => {
    const styles = colorClasses[color];

    return (
        <Card className={cn('relative overflow-hidden', styles.bg)}>
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-text-secondary">
                        {title}
                    </p>
                    <p className={cn('text-3xl font-bold', styles.text)}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-text-secondary">
                            {subtitle}
                        </p>
                    )}
                    {trend && (
                        <div className={cn(
                            'flex items-center gap-1 text-xs font-medium',
                            trend.isPositive ? 'text-success' : 'text-error'
                        )}>
                            <TrendingUp className={cn(
                                'w-3 h-3',
                                !trend.isPositive && 'rotate-180'
                            )} />
                            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                            <span className="text-text-secondary">vs anterior</span>
                        </div>
                    )}
                </div>
                <div className={cn(
                    'p-3 rounded-xl',
                    styles.icon
                )}>
                    <Icon className={cn('w-6 h-6', styles.text)} />
                </div>
            </div>
        </Card>
    );
};

interface StatsCardsProps {
    totalExams: number;
    passRate: number;
    bestScore: number;
    averageScore: number;
    lastExamTrend?: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
    totalExams,
    passRate,
    bestScore,
    averageScore,
    lastExamTrend,
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total de Provas"
                value={totalExams}
                subtitle={totalExams === 1 ? 'prova realizada' : 'provas realizadas'}
                icon={ClipboardList}
                color="orange"
            />
            <StatCard
                title="Taxa de Aprovação"
                value={`${passRate}%`}
                subtitle={passRate >= 70 ? 'Acima da média!' : 'Continue praticando'}
                icon={Target}
                color={passRate >= 70 ? 'green' : 'orange'}
            />
            <StatCard
                title="Melhor Score"
                value={bestScore}
                subtitle="pontos (max: 1000)"
                icon={Trophy}
                color="blue"
            />
            <StatCard
                title="Média de Score"
                value={averageScore}
                subtitle="pontos"
                icon={TrendingUp}
                color="purple"
                trend={lastExamTrend ? {
                    value: lastExamTrend,
                    isPositive: lastExamTrend > 0,
                } : undefined}
            />
        </div>
    );
};
