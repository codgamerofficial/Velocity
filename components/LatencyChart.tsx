
import React from 'react';
import { AreaChart, Area, YAxis, ResponsiveContainer, XAxis, Brush, Tooltip, CartesianGrid } from 'recharts';
import { PingPoint } from '../types';
import { Activity } from 'lucide-react';

interface LatencyChartProps {
  data: PingPoint[];
}

const LatencyChart: React.FC<LatencyChartProps> = ({ data }) => {
  const color = '#F59E0B'; // Amber for Latency

  // Determine if we have data to show
  const hasData = data.length > 0;

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
            <span className="text-lg font-bold tabular-nums" style={{ color: color }}>
              {Number(payload[0].value).toFixed(0)}
            </span>
            <span className="text-xs text-secondary font-medium">ms</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full">
      {/* Header/Controls */}
      <div className="px-6 py-2 flex items-center justify-between text-xs font-mono border-b border-glassBorder/50">
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-accent-yellow" />
          <span className="text-secondary transition-colors group-hover/graph:text-primary">
             REAL-TIME LATENCY
          </span>
        </div>
        <div className="text-accent-yellow/80 text-[10px] uppercase">
          Measuring Response
        </div>
      </div>

      <div className="h-72 w-full relative overflow-hidden rounded-b-xl pb-2 bg-surface/30">
        {!hasData ? (
           <div className="absolute inset-0 flex items-center justify-center text-secondary text-sm font-mono">
             Initializing Ping Test...
           </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border-glass)" strokeDasharray="4 4" />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: 'var(--text-secondary)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.3 }} 
              />
              <Area
                type="monotone"
                dataKey="ping"
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPing)"
                isAnimationActive={false} 
              />
              <Brush 
                dataKey="time" 
                height={30} 
                stroke={color} 
                fill="var(--bg-panel)" 
                tickFormatter={(val) => new Date(val).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}
                travellerWidth={14}
                className="text-[10px]"
                alwaysShowText={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        
        {/* Current Value Overlay */}
        {hasData && (
          <div className="absolute top-2 left-4 font-mono text-xs bg-panel/80 backdrop-blur-sm px-2 py-1 rounded border border-glassBorder text-primary pointer-events-none">
             Last: {data[data.length - 1].ping} ms
          </div>
        )}

        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] dark:bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
      </div>
    </div>
  );
};

export default LatencyChart;
