import React, { useEffect, useState } from 'react';
import { MAX_SPEED_METER } from '../constants';
import { TestPhase } from '../types';

interface SpeedometerProps {
  speed: number;
  phase: TestPhase;
  max?: number;
  limit?: number | null;
}

const Speedometer: React.FC<SpeedometerProps> = ({ speed, phase, max = MAX_SPEED_METER, limit }) => {
  // Visual configuration
  const radius = 120;
  const strokeWidth = 8;
  const center = 150;
  const startAngle = 135; // Bottom left
  const endAngle = 405;   // Bottom right (270 degree sweep)
  const circumference = 2 * Math.PI * radius;
  
  // Spring physics state
  const [displaySpeed, setDisplaySpeed] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    let current = displaySpeed;
    let velocity = 0;
    
    // Spring constants
    const tension = 0.08;
    const friction = 0.85;

    const animate = () => {
      const diff = speed - current;
      // Apply force
      velocity += diff * tension;
      // Apply friction
      velocity *= friction;
      // Update position
      current += velocity;

      // Micro-jitters for "alive" feel only when active
      if (speed > 0 && (phase === TestPhase.DOWNLOAD || phase === TestPhase.UPLOAD)) {
        current += (Math.random() - 0.5) * 2; 
      }

      if (Math.abs(diff) < 0.1 && Math.abs(velocity) < 0.1) {
        current = speed;
      }

      setDisplaySpeed(Math.max(0, current));

      if (Math.abs(diff) > 0.1 || Math.abs(velocity) > 0.1 || speed > 0) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, phase]);

  // Calculate stroke dash based on percentage
  const percentage = Math.min(displaySpeed / max, 1);
  const arcLength = circumference * (270 / 360); // 270 degree arc
  const strokeDashoffset = arcLength - (arcLength * percentage);
  
  // Limit Marker Calculation
  const renderLimitMarker = () => {
    if (!limit || limit >= max) return null;
    
    const limitRatio = Math.min(limit / max, 1);
    const deg = startAngle + (limitRatio * 270);
    const rad = (deg * Math.PI) / 180;
    
    const innerR = radius - 15;
    const outerR = radius + 10;
    
    const x1 = center + innerR * Math.cos(rad);
    const y1 = center + innerR * Math.sin(rad);
    const x2 = center + outerR * Math.cos(rad);
    const y2 = center + outerR * Math.sin(rad);

    return (
      <g className="transition-opacity duration-500">
        <line 
          x1={x1} y1={y1} x2={x2} y2={y2} 
          stroke="#EF4444" 
          strokeWidth={3} 
          strokeLinecap="round"
          className="drop-shadow-[0_0_4px_rgba(239,68,68,0.8)]"
        />
        <circle cx={x2} cy={y2} r={2} fill="#EF4444" className="animate-pulse" />
      </g>
    );
  };

  // Dynamic Color
  const getStrokeColor = () => {
    if (phase === TestPhase.UPLOAD) return '#9D6CFF'; // Purple
    if (phase === TestPhase.DOWNLOAD) return '#00D4FF'; // Cyan
    return '#475569'; // Slate
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[350px] aspect-square">
      {/* Glow effect behind */}
      <div 
        className="absolute inset-0 rounded-full opacity-20 blur-3xl transition-colors duration-500"
        style={{ background: phase === TestPhase.IDLE ? 'transparent' : getStrokeColor() }}
      />

      <svg width="300" height="300" viewBox="0 0 300 300" className="relative z-10 drop-shadow-2xl">
        {/* Defs for gradients */}
        <defs>
          <linearGradient id="gradDownload" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00D4FF" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="gradUpload" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9D6CFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9D6CFF" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-track)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          transform={`rotate(${startAngle + 90} ${center} ${center})`}
          strokeLinecap="round"
        />

        {/* Progress Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={phase === TestPhase.UPLOAD ? "url(#gradUpload)" : "url(#gradDownload)"}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(${startAngle + 90} ${center} ${center})`}
          strokeLinecap="round"
          className="transition-all duration-75 ease-linear"
          style={{ filter: 'drop-shadow(0 0 4px rgba(0,212,255,0.5))' }}
        />

        {/* Ticks and Labels */}
        {Array.from({ length: 11 }).map((_, i) => {
           const deg = startAngle + (i * (270 / 10));
           const rad = (deg * Math.PI) / 180;
           
           const innerR = radius - 15;
           const outerR = radius - 5;
           // Text label position (further inside)
           const labelR = radius - 32;

           const x1 = center + innerR * Math.cos(rad);
           const y1 = center + innerR * Math.sin(rad);
           const x2 = center + outerR * Math.cos(rad);
           const y2 = center + outerR * Math.sin(rad);

           const lx = center + labelR * Math.cos(rad);
           const ly = center + labelR * Math.sin(rad);

           const isMajor = i % 5 === 0; // Emphasize start, middle, end
           const value = Math.round((i / 10) * max);

           return (
             <g key={i}>
               <line 
                  x1={x1} y1={y1} x2={x2} y2={y2} 
                  stroke="var(--text-secondary)"
                  strokeOpacity={isMajor ? 0.5 : 0.2}
                  strokeWidth={isMajor ? 2 : 1} 
               />
               <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--text-secondary)" 
                  className="text-[10px] font-mono font-medium select-none pointer-events-none"
                  style={{ fontSize: '10px', opacity: 0.8 }}
               >
                 {value}
               </text>
             </g>
           );
        })}

        {/* Limit Marker */}
        {renderLimitMarker()}
      </svg>

      {/* Digital Readout Center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 z-20">
        <div className="flex items-baseline gap-1">
          <span className={`text-6xl font-bold tracking-tighter tabular-nums transition-colors duration-300 ${
            phase === TestPhase.UPLOAD ? 'text-accent-purple' : 'text-primary'
          }`}>
            {displaySpeed.toFixed(0)}
          </span>
          <span className="text-secondary text-sm font-medium">Mbps</span>
        </div>
        <div className="mt-1 px-2 py-0.5 rounded-full bg-glass border border-glassBorder backdrop-blur-sm">
           <span className="text-[10px] uppercase tracking-widest text-secondary font-semibold">
             {phase === TestPhase.IDLE ? 'READY' : phase}
           </span>
        </div>
      </div>
    </div>
  );
};

export default Speedometer;