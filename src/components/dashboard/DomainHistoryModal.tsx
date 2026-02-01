
import React from 'react';
import { Card } from '../ui/Card';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import type { DomainKey } from '../../types';
import { DOMAIN_INFO } from '../../types';
import { Modal } from '../ui/Modal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DomainHistoryData {
    date: string;
    score: number;
    passed: boolean;
}

interface DomainHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    domain: DomainKey | null;
    history: DomainHistoryData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                <p className="text-sm font-medium mb-1">
                    {format(new Date(label), "d 'de' MMMM", { locale: ptBR })}
                </p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-aws-light-blue" />
                    <span className="text-sm">
                        Acerto: <span className="font-bold">{payload[0].value}%</span>
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export const DomainHistoryModal: React.FC<DomainHistoryModalProps> = ({
    isOpen,
    onClose,
    domain,
    history,
}) => {
    const domainInfo = domain ? DOMAIN_INFO[domain] : null;

    if (!domain || !domainInfo) return null;

    // Filter relevant history? 
    // The history prop assumes it acts like 'points' (date, score).
    // The parent should map attempts to domain scores.

    if (history.length === 0) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={`Evolução: ${domainInfo.name}`}>
                <div className="text-center py-12 text-text-secondary">
                    <p>Sem dados suficientes para gerar histórico.</p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Evolução de Desempenho: ${domainInfo.name}`}
            className="max-w-4xl"
        >
            <div className="h-[400px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={history}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id={`colorScore-${domain}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={`var(--color-${domainInfo.color})`} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={`var(--color-${domainInfo.color})`} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(str) => format(new Date(str), 'dd/MM')}
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            unit="%"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={70} stroke="#ff9900" strokeDasharray="3 3" label={{ value: "Meta (70%)", fill: "#ff9900", fontSize: 10 }} />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke={`var(--color-${domainInfo.color})`}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#colorScore-${domain})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-xs text-text-secondary">
                <p>O gráfico exibe sua porcentagem de acertos apenas nas questões deste domínio ao longo das tentativas.</p>
            </div>
        </Modal>
    );
};
