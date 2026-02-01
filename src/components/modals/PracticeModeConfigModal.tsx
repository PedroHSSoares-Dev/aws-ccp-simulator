import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { DOMAIN_INFO } from '../../types';
import type { DomainKey } from '../../types';
import { BookOpen, Filter } from 'lucide-react';

export type PracticeModeConfig = {
    maxQuestions: number | 'all';
    selectedDomains: DomainKey[];
    duration?: number;
};

interface PracticeModeConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (config: PracticeModeConfig) => void;
}

export const PracticeModeConfigModal: React.FC<PracticeModeConfigModalProps> = ({
    isOpen,
    onClose,
    onStart,
}) => {
    // State
    const [maxQuestions, setMaxQuestions] = useState<number | 'all'>(20);
    const [duration, setDuration] = useState<number>(0);
    const [selectedDomains, setSelectedDomains] = useState<DomainKey[]>(['domain1', 'domain2', 'domain3', 'domain4']);

    const handleConfirm = () => {
        onStart({
            maxQuestions,
            selectedDomains,
            duration, // Pass duration
        });
        onClose();
    };

    const toggleDomain = (domain: DomainKey) => {
        if (selectedDomains.includes(domain)) {
            setSelectedDomains(prev => prev.filter(d => d !== domain));
        } else {
            setSelectedDomains(prev => [...prev, domain]);
        }
    };

    const selectAllDomains = () => {
        setSelectedDomains(['domain1', 'domain2', 'domain3', 'domain4']);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Modo Prática"
            description="Configure sua sessão de prática com feedback instantâneo."
            size="md"
        >
            <div className="space-y-6 mt-4">
                {/* Mode Info */}
                <div className="flex items-center gap-2 p-3 bg-aws-light-blue/10 rounded-lg text-aws-light-blue">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-medium">
                        Feedback instantâneo após cada resposta
                    </span>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Quantidade de Questões
                    </label>
                    <div className="flex gap-2 flex-wrap mb-2">
                        {[10, 20, 30, 50].map((count) => (
                            <button
                                key={count}
                                onClick={() => setMaxQuestions(count)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${maxQuestions === count
                                    ? 'bg-aws-light-blue text-white'
                                    : 'bg-card border border-border text-text-secondary hover:bg-card-hover'
                                    }`}
                            >
                                {count}
                            </button>
                        ))}
                        <button
                            onClick={() => setMaxQuestions('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${maxQuestions === 'all'
                                ? 'bg-aws-light-blue text-white'
                                : 'bg-card border border-border text-text-secondary hover:bg-card-hover'
                                }`}
                        >
                            Todas
                        </button>
                    </div>
                </div>

                {/* Timer Config */}
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Tempo Limite (Minutos)
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setDuration(0)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${duration === 0
                                ? 'bg-aws-light-blue text-white'
                                : 'bg-card border border-border text-text-secondary hover:bg-card-hover'
                                }`}
                        >
                            Sem Tempo
                        </button>
                        {[30, 60, 90].map((time) => (
                            <button
                                key={time}
                                onClick={() => setDuration(time)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${duration === time
                                    ? 'bg-aws-light-blue text-white'
                                    : 'bg-card border border-border text-text-secondary hover:bg-card-hover'
                                    }`}
                            >
                                {time} min
                            </button>
                        ))}
                    </div>
                </div>

                {/* Domain Filter */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filtrar por Domínio
                        </label>
                        <button
                            onClick={selectAllDomains}
                            className="text-xs text-aws-light-blue hover:underline"
                        >
                            Selecionar Todos
                        </button>
                    </div>
                    <div className="space-y-2">
                        {(Object.entries(DOMAIN_INFO) as [DomainKey, typeof DOMAIN_INFO[DomainKey]][]).map(([key, info]) => (
                            <label
                                key={key}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedDomains.includes(key)
                                    ? 'border-border bg-card'
                                    : 'border-transparent bg-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedDomains.includes(key)}
                                    onChange={() => toggleDomain(key)}
                                    className="w-4 h-4 rounded text-aws-light-blue focus:ring-aws-light-blue"
                                />
                                <span className="flex-1 text-sm font-medium text-text-primary">
                                    {info.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-2">
                    <Button variant="ghost" onClick={onClose} className="flex-1">
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        className="flex-1"
                        disabled={selectedDomains.length === 0}
                    >
                        Iniciar Prática
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
