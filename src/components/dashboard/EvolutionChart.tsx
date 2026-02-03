// ============================================================================
// Evolution Chart - Score progression over time
// ============================================================================

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { Card } from '../ui/Card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExamDataPoint {
    date: string;
    score: number;
    passed: boolean;
}

interface EvolutionChartProps {
    data: ExamDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                <p className="text-sm font-medium text-text-primary">
                    {format(new Date(label), "dd 'de' MMMM HH:mm", { locale: ptBR })}
                </p>
                <p className="text-lg font-bold text-aws-orange">
                    {data.score} pontos
                </p>
                <p className={`text-xs font-medium ${data.passed ? 'text-success' : 'text-error'}`}>
                    {data.passed ? '✓ Aprovado' : '✗ Reprovado'}
                </p>
            </div>
        );
    }
    return null;
};

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ data }) => {
    if (data.length === 0) {
        return (
            <Card className="h-80 flex items-center justify-center">
                <div className="text-center text-text-secondary">
                    <p className="text-lg font-medium">Sem dados ainda</p>
                    <p className="text-sm">Complete sua primeira prova para ver a evolução</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
                Evolução de Pontuação
            </h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border)"
                            opacity={0.5}
                        />
                        <XAxis
                            dataKey="date"
                            stroke="var(--color-text-secondary)"
                            fontSize={12}
                            tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                        />
                        <YAxis
                            domain={[0, 1000]}
                            ticks={[0, 200, 400, 600, 700, 800, 1000]}
                            stroke="var(--color-text-secondary)"
                            fontSize={12}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine
                            y={700}
                            stroke="var(--color-success)"
                            strokeDasharray="5 5"
                            label={{
                                value: 'Aprovação (700)',
                                position: 'right',
                                fill: 'var(--color-success)',
                                fontSize: 11,
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="var(--color-aws-orange)"
                            strokeWidth={3}
                            dot={{
                                fill: 'var(--color-aws-orange)',
                                strokeWidth: 2,
                                r: 6,
                            }}
                            activeDot={{
                                r: 8,
                                stroke: 'var(--color-aws-orange)',
                                strokeWidth: 2,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
