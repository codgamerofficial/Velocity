
import React, { useEffect, useState } from 'react';
import { X, Sparkles, AlertTriangle, CheckCircle, Bot } from 'lucide-react';
import { TestResult } from '../types';
import { analyzeNetworkResult } from '../services/aiAnalyzer';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TestResult;
  onAnalysisComplete?: (analysis: string) => void;
}

const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ isOpen, onClose, result, onAnalysisComplete }) => {
  // Initialize with existing analysis if available
  const [analysis, setAnalysis] = useState<string | null>(result.aiAnalysis || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If open, and we don't have analysis (even from props init), and not currently loading...
    if (isOpen && !analysis && !loading) {
      // Double check prop just in case it updated before mount (unlikely but safe)
      if (result.aiAnalysis) {
        setAnalysis(result.aiAnalysis);
        return;
      }

      setLoading(true);
      analyzeNetworkResult(result).then(text => {
        setAnalysis(text);
        setLoading(false);
        if (onAnalysisComplete) {
          onAnalysisComplete(text);
        }
      });
    }
  }, [isOpen, result, analysis, loading, onAnalysisComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl p-6 md:p-8 shadow-2xl border border-accent-purple/30 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-purple to-blue-600 shadow-lg shadow-accent-purple/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">Gemini Network Intelligence</h2>
              <p className="text-xs text-secondary">AI-Powered Connection Analysis</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-glass text-secondary hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="min-h-[200px] bg-panel/50 rounded-xl p-6 border border-glassBorder font-mono text-sm leading-relaxed relative overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-accent-purple animate-pulse">
              <Bot className="w-8 h-8" />
              <span>Analyzing packets & latency metrics...</span>
            </div>
          ) : (
            <div className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap text-primary/90">
              {analysis}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-primary text-surface hover:opacity-90 font-medium transition-opacity"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisModal;
