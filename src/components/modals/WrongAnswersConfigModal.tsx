import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useHistoryStore } from '../../stores/historyStore';
import { DOMAIN_INFO } from '../../types';
import type { DomainKey } from '../../types';
import { AlertCircle, Filter, SortAsc } from 'lucide-react';

export type WrongAnswersConfig = {
    maxQuestions: number | 'all';
    selectedDomains: DomainKey[];
    sortBy: 'recent' | 'frequent';
};

interface WrongAnswersConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (config: WrongAnswersConfig) => void;
}

export const WrongAnswersConfigModal: React.FC<WrongAnswersConfigModalProps> = ({
    isOpen,
    onClose,
    onStart,
}) => {
    // State
    const [maxQuestions, setMaxQuestions] = useState<number | 'all'>(20);
    const [selectedDomains, setSelectedDomains] = useState<DomainKey[]>(['domain1', 'domain2', 'domain3', 'domain4']);
    const [sortBy, setSortBy] = useState<'recent' | 'frequent'>('recent');

    // Store data
    const getFilteredWrongQuestionIds = useHistoryStore(state => state.getFilteredWrongQuestionIds);
    const [availableCount, setAvailableCount] = useState(0);

    // Update available count when filters change
    useEffect(() => {
        if (isOpen) {
            const ids = getFilteredWrongQuestionIds({
                domains: selectedDomains,
                sortBy: sortBy, // Sort doesn't affect count but good to pass if needed later
            });
            setAvailableCount(ids.length);
        }
    }, [isOpen, selectedDomains, sortBy, getFilteredWrongQuestionIds]);

    const handleConfirm = () => {
        onStart({
            maxQuestions,
            selectedDomains,
            sortBy,
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
            title="Revisão de Erros"
            description="Configure sua prova de revisão focada nas suas dificuldades."
            size="md"
        >
            <div className="space-y-6 mt-4">
                {/* Available Questions Badge */}
                <div className="flex items-center gap-2 p-3 bg-aws-light-blue/10 rounded-lg text-aws-light-blue">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">
                        {availableCount} questões disponíveis com os filtros atuais
                    </span>
                </div>

                {/* Question Limit */}
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Limite de Questões
                    </label>
                    <div className="flex gap-2">
                        {[10, 20, 30, 50].map((count) => (
                            <button
                                key={count}
                                onClick={() => setMaxQuestions(count)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${maxQuestions === count
                                        ? 'bg-aws-orange text-white'
                                        : 'bg-card border border-border text-text-secondary hover:bg-card-hover'
                                    }`}
                            >
                                {count}
                            </button>
                        ))}
                        <button
                            onClick={() => setMaxQuestions('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${maxQuestions === 'all'
                                    ? 'bg-aws-orange text-white'
                                    : 'bg-card border border-border text-text-secondary hover:bg-card-hover'
                                }`}
                        >
                            Todas
                        </button>
                    </div>
                </div>

                {/* Sort Order */}
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                        <SortAsc className="w-4 h-4" />
                        Prioridade
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setSortBy('recent')}
                            className={`p-3 rounded-lg border text-left transition-all ${sortBy === 'recent'
                                    ? 'border-aws-light-blue bg-aws-light-blue/5 ring-1 ring-aws-light-blue'
                                    : 'border-border bg-card text-text-secondary hover:bg-card-hover'
                                }`}
                        >
                            <div className="font-medium text-text-primary">Mais Recentes</div>
                            <div className="text-xs text-text-secondary mt-1">Foco no curto prazo</div>
                        </button>
                        <button
                            onClick={() => setSortBy('frequent')}
                            className={`p-3 rounded-lg border text-left transition-all ${sortBy === 'frequent'
                                    ? 'border-aws-light-blue bg-aws-light-blue/5 ring-1 ring-aws-light-blue'
                                    : 'border-border bg-card text-text-secondary hover:bg-card-hover'
                                }`}
                        >
                            <div className="font-medium text-text-primary">Mais Frequentes</div>
                            <div className="text-xs text-text-secondary mt-1">Foco em dificuldades reais</div>
                        </button>
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
                                    className="w-4 h-4 rounded text-aws-orange focus:ring-aws-orange"
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
                        disabled={availableCount === 0 || selectedDomains.length === 0}
                    >
                        Começar Revisão
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
