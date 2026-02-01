import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { formatTime } from '../../lib/utils';
import { Clock, AlertTriangle, Zap } from 'lucide-react';

interface TimerProps {
    timeRemaining: number; // In seconds, can be negative (overtime)
    onTick?: (newTime: number) => void;
    isPaused?: boolean;
    warningThreshold?: number; // Seconds remaining to show warning (default: 30 minutes)
    criticalThreshold?: number; // Seconds remaining to show critical (default: 5 minutes)
}

export const Timer: React.FC<TimerProps> = ({
    timeRemaining,
    onTick,
    isPaused = false,
    warningThreshold = 30 * 60, // 30 minutes
    criticalThreshold = 5 * 60, // 5 minutes
}) => {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const currentTimeRef = useRef(timeRemaining);

    // Sync ref with prop
    useEffect(() => {
        currentTimeRef.current = timeRemaining;
    }, [timeRemaining]);

    // Timer tick
    useEffect(() => {
        if (isPaused) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            const newTime = currentTimeRef.current - 1;
            currentTimeRef.current = newTime;
            onTick?.(newTime);
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPaused, onTick]);

    // Determine visual state
    const isOvertime = timeRemaining < 0;
    const isWarning = !isOvertime && timeRemaining <= warningThreshold;
    const isCritical = !isOvertime && timeRemaining <= criticalThreshold;

    // Determine colors and state
    const getTimerStyle = () => {
        if (isOvertime) {
            return {
                bg: 'bg-error/10',
                text: 'text-error',
                border: 'border-error',
                icon: <Zap className="w-5 h-5" />,
            };
        }
        if (isCritical) {
            return {
                bg: 'bg-error/10',
                text: 'text-error',
                border: 'border-error',
                icon: <AlertTriangle className="w-5 h-5 animate-pulse" />,
            };
        }
        if (isWarning) {
            return {
                bg: 'bg-warning/10',
                text: 'text-warning',
                border: 'border-warning',
                icon: <AlertTriangle className="w-5 h-5" />,
            };
        }
        return {
            bg: 'bg-card',
            text: 'text-text-primary',
            border: 'border-border',
            icon: <Clock className="w-5 h-5" />,
        };
    };

    const style = getTimerStyle();

    return (
        <div
            className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border',
                style.bg,
                style.border,
                isCritical && !isOvertime && 'animate-shake'
            )}
            role="timer"
            aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
        >
            <span className={cn('transition-colors', style.text)}>
                {style.icon}
            </span>
            <span
                className={cn(
                    'font-mono text-xl font-bold tabular-nums',
                    style.text
                )}
            >
                {formatTime(timeRemaining)}
            </span>
            {isOvertime && (
                <span className="text-xs text-error font-medium uppercase tracking-wide">
                    Overtime
                </span>
            )}
        </div>
    );
};
