// ============================================================================
// Recent Exams Table - List of recent exam attempts
// ============================================================================

import { Card } from '../ui/Card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import {
    CheckCircle,
    XCircle,
    Clock,
    ChevronRight,
    History,
} from 'lucide-react';

interface ExamAttempt {
    id: string;
    date: string;
    score: number;
    passed: boolean;
    duration: number; // in minutes
    mode: 'official' | 'practice' | 'quick' | 'wrong-answers';
    totalQuestions: number;
    correctAnswers: number;
}

interface RecentExamsTableProps {
    attempts: ExamAttempt[];
    onViewDetails?: (id: string) => void;
}

const modeLabels = {
    official: 'Oficial',
    practice: 'Prática',
    quick: 'Rápido',
    'wrong-answers': 'Erros',
};

const modeColors = {
    official: 'bg-aws-orange/10 text-aws-orange',
    practice: 'bg-aws-light-blue/10 text-aws-light-blue',
    quick: 'bg-purple-500/10 text-purple-500',
    'wrong-answers': 'bg-error/10 text-error',
};

export const RecentExamsTable: React.FC<RecentExamsTableProps> = ({
    attempts,
    onViewDetails
}) => {
    if (attempts.length === 0) {
        return (
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-text-secondary" />
                    <h3 className="text-lg font-semibold text-text-primary">
                        Histórico de Provas
                    </h3>
                </div>
                <div className="py-8 text-center text-text-secondary">
                    <p>Nenhuma prova realizada ainda</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-text-secondary" />
                    <h3 className="text-lg font-semibold text-text-primary">
                        Histórico de Provas
                    </h3>
                </div>
                <span className="text-sm text-text-secondary">
                    {attempts.length} {attempts.length === 1 ? 'prova' : 'provas'}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-3 px-2 text-sm font-medium text-text-secondary">
                                Data
                            </th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-text-secondary">
                                Modo
                            </th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-text-secondary">
                                Score
                            </th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-text-secondary">
                                Acertos
                            </th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-text-secondary">
                                Tempo
                            </th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-text-secondary">
                                Status
                            </th>
                            <th className="py-3 px-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {attempts.map((attempt) => (
                            <tr
                                key={attempt.id}
                                className="border-b border-border/50 hover:bg-card-hover transition-colors cursor-pointer"
                                onClick={() => onViewDetails?.(attempt.id)}
                            >
                                <td className="py-3 px-2">
                                    <span className="text-sm text-text-primary">
                                        {format(new Date(attempt.date), "dd/MM/yyyy", { locale: ptBR })}
                                    </span>
                                    <span className="block text-xs text-text-secondary">
                                        {format(new Date(attempt.date), "HH:mm", { locale: ptBR })}
                                    </span>
                                </td>
                                <td className="py-3 px-2">
                                    <span className={cn(
                                        'px-2 py-1 rounded-full text-xs font-medium',
                                        modeColors[attempt.mode]
                                    )}>
                                        {modeLabels[attempt.mode]}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <span className={cn(
                                        'font-bold',
                                        attempt.passed ? 'text-success' : 'text-error'
                                    )}>
                                        {attempt.score}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <span className="text-sm text-text-secondary">
                                        {attempt.correctAnswers}/{attempt.totalQuestions}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <div className="flex items-center justify-center gap-1 text-sm text-text-secondary">
                                        <Clock className="w-3 h-3" />
                                        <span>{attempt.duration}min</span>
                                    </div>
                                </td>
                                <td className="py-3 px-2 text-center">
                                    {attempt.passed ? (
                                        <div className="flex items-center justify-center gap-1 text-success">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-xs font-medium">Aprovado</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-1 text-error">
                                            <XCircle className="w-4 h-4" />
                                            <span className="text-xs font-medium">Reprovado</span>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-2">
                                    <ChevronRight className="w-4 h-4 text-text-secondary" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
