import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outlined' | 'interactive';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
    default: 'bg-card border border-border',
    elevated: 'bg-card shadow-lg border border-border/50',
    outlined: 'bg-transparent border-2 border-border',
    interactive: `
    bg-card border border-border
    hover:bg-card-hover hover:border-aws-orange/30
    hover:shadow-md
    cursor-pointer
    transition-all duration-200
  `,
};

const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-5',
    lg: 'p-6 md:p-8',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            variant = 'default',
            padding = 'md',
            children,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-xl',
                    variantStyles[variant],
                    paddingStyles[padding],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

// Card sub-components for composition
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

export const CardHeader: React.FC<CardHeaderProps> = ({
    className,
    children,
    ...props
}) => (
    <div
        className={cn('mb-4 pb-3 border-b border-border', className)}
        {...props}
    >
        {children}
    </div>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export const CardTitle: React.FC<CardTitleProps> = ({
    className,
    as: Component = 'h3',
    children,
    ...props
}) => (
    <Component
        className={cn('text-lg font-semibold text-text-primary', className)}
        {...props}
    >
        {children}
    </Component>
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> { }

export const CardContent: React.FC<CardContentProps> = ({
    className,
    children,
    ...props
}) => (
    <div className={cn('', className)} {...props}>
        {children}
    </div>
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

export const CardFooter: React.FC<CardFooterProps> = ({
    className,
    children,
    ...props
}) => (
    <div
        className={cn('mt-4 pt-3 border-t border-border flex gap-3', className)}
        {...props}
    >
        {children}
    </div>
);
