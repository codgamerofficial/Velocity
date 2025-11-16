
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, YAxis, ResponsiveContainer, XAxis, Brush, Tooltip, CartesianGrid } from 'recharts';
import { SpeedPoint, TestPhase } from '../types';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface LiveChartProps {
  downloadData: SpeedPoint[];
  uploadData: SpeedPoint[];
  phase: TestPhase;
}

const LiveChart: React.FC<LiveChartProps> = ({ downloadData, uploadData, phase }) => {
  const [activeTab, setActiveTab] = useState<'download' | 'upload'>('download');

  // Auto-switch tab based on active phase
  useEffect(() => {
    if (phase === TestPhase.DOWNLOAD) {
      setActiveTab('download');
    } else if (phase === TestPhase.UPLOAD) {
      setActiveTab('upload');
    }
  }, [phase]);

  const isDownload = activeTab === 'download';
  const color = isDownload ? '#00D4FF' : '#9D6CFF'; // Cyan vs Purple
  const currentData = isDownload ? downloadData : uploadData;
  
  // Determine if we have data to show
  const hasData = currentData.length > 0;

  // Custom Tooltip Component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-xl min-w-[120px]">
          <p className="text-[10px] font-mono text-secondary mb-1">
            {new Date(payload[0].payload.time).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold tabular-nums" style={{ color: color }}>
              {Number(payload[0].value).toFixed(1)}
            </span>
            <span className="text-xs text-secondary font-medium">Mbps</span>
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
          <span className="text-secondary transition-colors group-hover/graph:text-primary">
             THROUGHPUT HISTORY
          </span>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex bg-black/40 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('download')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
              activeTab === 'download' 
                ? 'bg-accent-cyan/20 text-accent-cyan shadow-sm' 
                : 'text-secondary hover:text-primary hover:bg-white/5'
            }`}
          >
            <ArrowDown className="w-3 h-3" />
            <span>Down</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
              activeTab === 'upload' 
                ? 'bg-accent-purple/20 text-accent-purple shadow-sm' 
                : 'text-secondary hover:text-primary hover:bg-white/5'
            }`}
          >
            <ArrowUp className="w-3 h-3" />
            <span>Up</span>
          </button>
        </div>
      </div>

      <div className="h-72 w-full relative overflow-hidden rounded-b-xl pb-2">
        {!hasData && phase === TestPhase.IDLE ? (
           <div className="absolute inset-0 flex items-center justify-center text-secondary text-sm font-mono">
             Start a test to view data
           </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`colorSpeed-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="speed"
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#colorSpeed-${activeTab})`}
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
          <div className="absolute top-2 left-4 font-mono text-xs bg-black/40 backdrop-blur-sm px-2 py-1 rounded border border-white/5 text-primary pointer-events-none">
             Max: {Math.max(...currentData.map(d => d.speed)).toFixed(1)} Mbps
          </div>
        )}

        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
      </div>
    </div>
  );
};

export default LiveChart;
