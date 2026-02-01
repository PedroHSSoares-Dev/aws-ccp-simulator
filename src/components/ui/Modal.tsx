import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    className?: string;
    children: React.ReactNode;
}

const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    className,
    children,
}) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-50"
                onClose={closeOnOverlayClick ? onClose : () => { }}
            >
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className={cn(
                                    'w-full transform overflow-hidden rounded-2xl',
                                    'bg-background p-6 text-left align-middle',
                                    'shadow-xl transition-all',
                                    'border border-border',
                                    sizeStyles[size]
                                )}
                            >
                                {/* Header */}
                                {(title || showCloseButton) && (
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            {title && (
                                                <Dialog.Title
                                                    as="h3"
                                                    className="text-xl font-semibold text-text-primary"
                                                >
                                                    {title}
                                                </Dialog.Title>
                                            )}
                                            {description && (
                                                <Dialog.Description className="mt-1 text-sm text-text-secondary">
                                                    {description}
                                                </Dialog.Description>
                                            )}
                                        </div>
                                        {showCloseButton && (
                                            <button
                                                onClick={onClose}
                                                className={cn(
                                                    'p-1 rounded-lg',
                                                    'text-text-secondary hover:text-text-primary',
                                                    'hover:bg-card transition-colors',
                                                    'focus:outline-none focus:ring-2 focus:ring-aws-orange/50'
                                                )}
                                                aria-label="Close modal"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Content */}
                                {children}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

// Alert dialog variant for confirmations
interface AlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'warning' | 'danger' | 'info';
}

const alertVariantStyles = {
    warning: {
        icon: '⚠️',
        buttonClass: 'bg-warning hover:bg-amber-500',
    },
    danger: {
        icon: '🚨',
        buttonClass: 'bg-error hover:bg-red-600',
    },
    info: {
        icon: 'ℹ️',
        buttonClass: 'bg-aws-light-blue hover:bg-blue-600',
    },
};

export const AlertDialog: React.FC<AlertDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'warning',
}) => {
    const styles = alertVariantStyles[variant];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            showCloseButton={false}
            closeOnOverlayClick={false}
        >
            <div className="text-center">
                <div className="text-4xl mb-4">{styles.icon}</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {title}
                </h3>
                <p className="text-text-secondary mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onClose}
                        className={cn(
                            'px-4 py-2 rounded-lg font-medium',
                            'bg-card hover:bg-border/50',
                            'text-text-primary',
                            'transition-colors'
                        )}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={cn(
                            'px-4 py-2 rounded-lg font-medium',
                            'text-white transition-colors',
                            styles.buttonClass
                        )}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
