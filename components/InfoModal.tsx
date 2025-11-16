import React from 'react';
import { X, Activity, Zap, ArrowDown, ShieldCheck, HelpCircle } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl p-6 md:p-8 shadow-2xl border border-glassBorder animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20">
              <HelpCircle className="w-6 h-6 text-accent-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">Understanding Velocity</h2>
              <p className="text-sm text-secondary">How we analyze your network performance</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-glass text-secondary hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8 overflow-y-auto pr-2">
          
          <section>
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              Core Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-glass border border-glassBorder hover:bg-glass/80 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-accent-yellow">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium text-sm">Ping (Latency)</span>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  The reaction time of your connection. It measures how fast you get a response after sending a request. Low ping (under 20ms) is crucial for real-time apps like gaming.
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-glass border border-glassBorder hover:bg-glass/80 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-accent-purple">
                  <Activity className="w-4 h-4" />
                  <span className="font-medium text-sm">Jitter</span>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  The variance in ping over time. High jitter causes "lag spikes" or stuttering in calls, even if your average ping is low. Ideally, this should be near 0ms.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-glass border border-glassBorder hover:bg-glass/80 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-accent-green">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-medium text-sm">Consistency</span>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                   A calculated score showing how stable your speed was during the test. 100% means the speed never dipped significantly below the peak throughput.
                </p>
              </div>

               <div className="p-4 rounded-xl bg-glass border border-glassBorder hover:bg-glass/80 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-accent-cyan">
                  <ArrowDown className="w-4 h-4" />
                  <span className="font-medium text-sm">Throughput</span>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  We test download (consuming content) and upload (sending content) separately using simulated high-bandwidth streams to stress-test capacity.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              How It Works
            </h3>
            <div className="bg-glass rounded-xl p-5 border border-glassBorder text-sm text-secondary leading-relaxed space-y-3">
              <p>
                <strong className="text-primary">Velocity</strong> is designed as a professional-grade analyzer. Unlike standard speed tests that only look for the highest peak number, we analyze the <span className="text-primary">stability</span> of that speed.
              </p>
              <p>
                The test engine simulates real-world traffic behavior, including TCP ramp-up phases and congestion control algorithms, to give you a realistic picture of how your internet performs during heavy loads like 4K streaming or large file transfers.
              </p>
            </div>
          </section>

        </div>
        
        <div className="mt-6 pt-4 border-t border-glassBorder flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 rounded-lg bg-primary text-surface font-medium hover:opacity-90 transition-opacity text-sm"
           >
             Close
           </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;