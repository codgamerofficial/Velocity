import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

interface StatCardProps {
  label: string;
  value: number | null;
  unit: string;
  icon: React.ReactNode;
  color?: string;
  decimals?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon, color = 'text-accent-cyan', decimals = 1 }) => {
  return (
    <motion.div
      className="glass-panel p-4 rounded-xl card-hover border border-glassBorder relative overflow-hidden group perspective"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Gradient border effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      {/* Background glow on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-secondary">
            {label}
          </span>
          <motion.div
            className={color}
            animate={{ scale: value !== null ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
        </div>
        <div className="flex items-baseline gap-1">
          <AnimatedCounter
            value={value}
            decimals={decimals}
            className="text-2xl font-bold text-primary"
          />
          {value !== null && (
            <motion.span
              className="text-sm text-secondary font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {unit}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;