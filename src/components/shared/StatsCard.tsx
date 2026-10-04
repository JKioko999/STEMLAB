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

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  trend
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
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

      <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
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
