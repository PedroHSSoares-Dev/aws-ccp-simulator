import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps {
    value: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'domain1' | 'domain2' | 'domain3' | 'domain4';
    showLabel?: boolean;
    animated?: boolean;
    className?: string;
}

const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
};

const variantStyles = {
    default: 'bg-aws-orange',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-error',
    domain1: 'bg-domain-1',
    domain2: 'bg-domain-2',
    domain3: 'bg-domain-3',
    domain4: 'bg-domain-4',
};

export const Progress: React.FC<ProgressProps> = ({
    value,
    max = 100,
    size = 'md',
    variant = 'default',
    showLabel = false,
    animated = true,
    className,
}) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={cn('w-full', className)}>
            {showLabel && (
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Progress</span>
                    <span className="font-medium text-text-primary">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
            <div
                className={cn(
                    'w-full bg-card rounded-full overflow-hidden',
                    sizeStyles[size]
                )}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
            >
                <div
                    className={cn(
                        'h-full rounded-full',
                        variantStyles[variant],
                        animated && 'transition-all duration-500 ease-out'
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// Circular progress variant
interface CircularProgressProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    showValue?: boolean;
    className?: string;
}

const circularVariantColors = {
    default: '#FF9900',
    success: '#037F0C',
    warning: '#FF9900',
    danger: '#D13212',
};

export const CircularProgress: React.FC<CircularProgressProps> = ({
    value,
    max = 100,
    size = 120,
    strokeWidth = 8,
    variant = 'default',
    showValue = true,
    className,
}) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className={cn('relative inline-flex', className)}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-card"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={circularVariantColors[variant]}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            {showValue && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-text-primary">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
        </div>
    );
};
