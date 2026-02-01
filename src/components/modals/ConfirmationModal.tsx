import React from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    variant?: 'primary' | 'danger';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    variant = 'primary'
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
        >
            <div className="mt-2">
                <p className="text-sm text-text-secondary">
                    {description}
                </p>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
                <Button variant="ghost" onClick={onClose} className="text-sm">
                    Cancelar
                </Button>
                <Button
                    variant={variant === 'danger' ? 'danger' : 'primary'}
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                >
                    {confirmText}
                </Button>
            </div>
        </Modal>
    );
};
