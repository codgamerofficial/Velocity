import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number | null;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string; // text color class
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon, color = 'text-primary' }) => {
  return (
    <div className="glass-panel p-4 rounded-xl flex flex-col items-start justify-between min-h-[100px] transition-all duration-300 hover:bg-glass">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-secondary">{label}</span>
        {icon && <span className="text-secondary opacity-50">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1 mt-auto">
        <span className={`text-2xl font-semibold tabular-nums ${color}`}>
          {value !== null ? value : '--'}
        </span>
        {unit && <span className="text-xs text-secondary font-medium">{unit}</span>}
      </div>
    </div>
  );
};

export default StatCard;