
import React from 'react';
import { AreaChart, Area, YAxis, ResponsiveContainer, XAxis, Brush, Tooltip, CartesianGrid } from 'recharts';
import { PacketLossPoint, TestPhase } from '../types';

interface PacketLossChartProps {
  data: PacketLossPoint[];
  phase: TestPhase;
}

const PacketLossChart: React.FC<PacketLossChartProps> = ({ data, phase }) => {
  const color = '#EF4444'; // Red for danger/loss

  // Custom Tooltip Component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel rounded-lg p-3 shadow-xl min-w-[120px] border border-glassBorder backdrop-blur-md bg-panel/95">
          <p className="text-[10px] font-mono text-secondary mb-1">
            {new Date(payload[0].payload.time).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold tabular-nums text-red-400">
              {Number(payload[0].value).toFixed(2)}
            </span>
            <span className="text-xs text-secondary font-medium">%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Only show chart if we have data or are active
  if (data.length === 0 && phase === TestPhase.IDLE) {
    return (
      <div className="h-36 w-full flex items-center justify-center bg-surface/30 text-secondary text-xs font-mono">
        Waiting for packet analysis...
      </div>
    );
  }

  return (
    <div className="h-48 w-full relative overflow-hidden pb-2 bg-surface/30">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border-glass)" strokeDasharray="4 4" />
          <XAxis dataKey="time" hide />
          {/* Packet loss is typically low, so we scale domain to exaggerate small values for visibility, max 5% */}
          <YAxis hide domain={[0, 5]} />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: 'var(--text-secondary)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.3 }} 
          />
          <Area
            type="monotone"
            dataKey="loss"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorLoss)"
            isAnimationActive={false}
          />
          <Brush 
            dataKey="time" 
            height={30} 
            stroke="var(--text-secondary)"
            fill="var(--bg-panel)" 
            tickFormatter={(val) => new Date(val).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}
            travellerWidth={14}
            className="text-[10px]"
            alwaysShowText={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] dark:bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
    </div>
  );
};

export default PacketLossChart;
