import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'emerald' | 'blue' | 'amber' | 'violet' | 'rose' | 'cyan';
}

// Accent bar and dot colours per card (full class names so Tailwind can see them)
const ACCENTS: Record<NonNullable<StatsCardProps['color']>, { bar: string; dot: string }> = {
  emerald: { bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  blue: { bar: 'bg-sky-500', dot: 'bg-sky-500' },
  amber: { bar: 'bg-amber-500', dot: 'bg-amber-500' },
  violet: { bar: 'bg-violet-500', dot: 'bg-violet-500' },
  rose: { bar: 'bg-rose-500', dot: 'bg-rose-500' },
  cyan: { bar: 'bg-cyan-500', dot: 'bg-cyan-500' }
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  color = 'emerald'
}) => {
  const accent = ACCENTS[color];
  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`absolute inset-x-0 top-0 h-[3px] ${accent.bar}`} />
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
          {title}
        </span>
        {trend && (
          <span className={`text-[11px] font-medium ${
            trend.isPositive 
              ? 'text-emerald-700 dark:text-emerald-400' 
              : 'text-rose-700 dark:text-rose-400'
          }`}>
            {trend.value}
          </span>
        )}
      </div>

      <div className="text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight mt-2">
        {value}
      </div>

      {subtitle && (
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};