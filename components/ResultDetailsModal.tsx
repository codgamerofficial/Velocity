
import React, { useState, useEffect } from 'react';
import { X, Calendar, Server, Globe, Activity, Zap, ArrowDown, ArrowUp, ShieldCheck, Smartphone, Wifi, Cable, MapPin, Router, Network, Share2, Check, Copy, Download, Sparkles, Database, FileJson, Scale, AlertTriangle, ThumbsUp, Info } from 'lucide-react';
import { TestResult } from '../types';
import AIAnalysisModal from './AIAnalysisModal';

interface ResultDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TestResult | null;
  onUpdateResult?: (id: string, updates: Partial<TestResult>) => void;
  startWithAI?: boolean;
}

const ResultDetailsModal: React.FC<ResultDetailsModalProps> = ({ isOpen, onClose, result, onUpdateResult, startWithAI = false }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Auto-trigger AI modal if requested via prop
  useEffect(() => {
    if (isOpen && startWithAI) {
      setShowAI(true);
    }
    if (!isOpen) {
      setShowAI(false);
    }
  }, [isOpen, startWithAI]);

  if (!isOpen || !result) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = async () => {
    const shareText = `Velocity Speed Test Result
Download: ${result.downloadSpeed.toFixed(1)} Mbps
Upload: ${result.uploadSpeed.toFixed(1)} Mbps
Ping: ${result.ping} ms | Stability: ${result.stabilityScore}/100
Server: ${result.serverLocation}
Provider: ${result.provider || 'Unknown'}
Date: ${new Date(result.timestamp).toLocaleString()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Velocity Speed Test Result',
          text: shareText,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `velocity_result_${result.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleAnalysisComplete = (analysis: string) => {
    if (result && onUpdateResult) {
      onUpdateResult(result.id, { aiAnalysis: analysis });
    }
  };

  // Advice Logic
  const getStabilityAdvice = (score: number) => {
    if (score >= 90) {
      return {
        level: 'Excellent',
        color: 'text-green-400',
        bg: 'bg-green-500/10 border-green-500/20',
        icon: <ThumbsUp className="w-4 h-4" />,
        message: "Your connection is rock solid. Perfect for competitive gaming, 4K streaming, and real-time calls."
      };
    } else if (score >= 70) {
      return {
        level: 'Good',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10 border-yellow-500/20',
        icon: <Activity className="w-4 h-4" />,
        message: "Connection is generally stable but may experience occasional micro-stuttering. Good for streaming, but sensitive apps might lag."
      };
    } else {
      return {
        level: 'Unstable',
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/20',
        icon: <AlertTriangle className="w-4 h-4" />,
        message: "High instability detected. This causes lag and buffering. Try moving closer to the router or using Ethernet."
      };
    }
  };

  const advice = getStabilityAdvice(result.stabilityScore);

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
          onClick={onClose}
        />
        <div className="relative w-full max-w-3xl glass-panel rounded-2xl p-6 md:p-8 shadow-2xl border border-glassBorder animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b border-glassBorder pb-6 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`group relative p-2 rounded-lg cursor-help ${
                  result.networkType === '5G' ? 'bg-purple-500/20 text-purple-400' :
                  result.networkType === 'WiFi' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {result.networkType === '5G' && <Smartphone className="w-6 h-6" />}
                  {result.networkType === 'WiFi' && <Wifi className="w-6 h-6" />}
                  {result.networkType === 'Ethernet' && <Cable className="w-6 h-6" />}
                  
                  {/* Tooltip for Client Info in Modal */}
                  {result.clientInfo && (
                    <div className="absolute top-full left-0 mt-2 w-72 p-0 rounded-xl bg-panel/95 backdrop-blur-xl border border-glassBorder shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none transform translate-y-2 group-hover:translate-y-0 overflow-hidden z-50">
                      <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Globe className="w-3 h-3 text-accent-cyan" />
                           <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-widest">Client Details</span>
                        </div>
                        {result.clientInfo.flagUrl && <img src={result.clientInfo.flagUrl} alt="flag" className="w-4 h-auto object-cover rounded-[2px]" />}
                      </div>
                      <div className="p-4 space-y-2 text-xs">
                        <div className="grid grid-cols-[min-content_1fr] gap-x-4 gap-y-1.5">
                          <span className="text-secondary font-medium whitespace-nowrap">Provider</span>
                          <span className="text-primary font-medium text-right truncate">{result.clientInfo.isp}</span>
                          
                          <span className="text-secondary font-medium whitespace-nowrap">Location</span>
                          <span className="text-primary font-medium text-right truncate">{result.clientInfo.city}, {result.clientInfo.region}</span>
                          
                          <span className="text-secondary font-medium whitespace-nowrap">IP</span>
                          <span className="text-primary font-mono text-right truncate">{result.clientInfo.ip}</span>

                          {result.clientInfo.asn && (
                            <>
                              <span className="text-secondary font-medium whitespace-nowrap">ASN</span>
                              <span className="text-primary font-mono text-right">{result.clientInfo.asn}</span>
                            </>
                          )}
                          
                          {result.clientInfo.org && result.clientInfo.org !== result.clientInfo.isp && (
                            <>
                              <span className="text-secondary font-medium whitespace-nowrap">Organization</span>
                              <span className="text-primary font-medium text-right truncate">{result.clientInfo.org}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-primary">{result.networkType} Speed Test</h2>
                    {result.isWifi6E && (
                      <span className="px-2 py-0.5 rounded bg-accent-cyan/20 text-accent-cyan text-[10px] font-bold tracking-wider border border-accent-cyan/30">
                        WI-FI 6E
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(result.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <button
                onClick={() => setShowAI(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-accent-purple to-blue-600 text-white shadow-lg hover:shadow-accent-purple/25 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                AI Analyze
              </button>

              <button
                onClick={handleExportJSON}
                className="p-2 rounded-full hover:bg-glass text-secondary hover:text-primary transition-colors border border-transparent hover:border-glassBorder"
                title="Export JSON"
              >
                <FileJson className="w-5 h-5" />
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-glass text-secondary hover:text-primary transition-colors border border-transparent hover:border-glassBorder"
                title={isCopied ? "Copied!" : "Share"}
              >
                {isCopied ? <Check className="w-5 h-5 text-accent-green" /> : <Share2 className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-glass text-secondary hover:text-primary transition-colors border border-transparent hover:border-glassBorder"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
             <div className="p-4 rounded-xl bg-glass border border-glassBorder flex flex-col items-center justify-center text-center">
               <span className="text-xs text-secondary uppercase tracking-wider mb-1 flex items-center gap-1"><ArrowDown className="w-3 h-3" /> Download</span>
               <span className="text-2xl font-bold text-accent-cyan">{result.downloadSpeed.toFixed(0)}</span>
               <span className="text-xs text-secondary">Mbps</span>
             </div>
             <div className="p-4 rounded-xl bg-glass border border-glassBorder flex flex-col items-center justify-center text-center">
               <span className="text-xs text-secondary uppercase tracking-wider mb-1 flex items-center gap-1"><ArrowUp className="w-3 h-3" /> Upload</span>
               <span className="text-2xl font-bold text-accent-purple">{result.uploadSpeed.toFixed(0)}</span>
               <span className="text-xs text-secondary">Mbps</span>
             </div>
             <div className="p-4 rounded-xl bg-glass border border-glassBorder flex flex-col items-center justify-center text-center">
               <span className="text-xs text-secondary uppercase tracking-wider mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Ping</span>
               <span className="text-2xl font-bold text-accent-yellow">{result.ping}</span>
               <span className="text-xs text-secondary">ms</span>
             </div>
             <div className="p-4 rounded-xl bg-glass border border-glassBorder flex flex-col items-center justify-center text-center relative overflow-hidden">
               {/* Highlight Stability */}
               <div className={`absolute inset-0 opacity-5 ${advice.color} bg-current`}></div>
               <span className="text-xs text-secondary uppercase tracking-wider mb-1 flex items-center gap-1 relative z-10"><Scale className="w-3 h-3" /> Stability</span>
               <span className={`text-2xl font-bold relative z-10 ${advice.color}`}>{result.stabilityScore}</span>
               <span className="text-xs text-secondary relative z-10">/ 100</span>
             </div>
          </div>

          {/* Detailed Info Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Network Context */}
            <div>
              <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <Server className="w-4 h-4" /> Network Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-glass hover:bg-glass/80 transition-colors">
                  <span className="text-sm text-secondary">Provider</span>
                  <span className="text-sm font-medium text-primary">{result.provider || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-glass hover:bg-glass/80 transition-colors">
                  <span className="text-sm text-secondary">Server</span>
                  <span className="text-sm font-medium text-primary">{result.serverLocation}</span>
                </div>
                {result.clientInfo?.ip && (
                   <div className="flex justify-between items-center p-3 rounded-lg bg-glass hover:bg-glass/80 transition-colors">
                    <span className="text-sm text-secondary">Client IP</span>
                    <span className="text-sm font-medium text-primary font-mono">{result.clientInfo.ip}</span>
                  </div>
                )}
                 <div className="flex justify-between items-center p-3 rounded-lg bg-glass hover:bg-glass/80 transition-colors">
                  <span className="text-sm text-secondary">Packet Loss</span>
                  <span className={`text-sm font-medium ${result.packetLoss > 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                    {result.packetLoss.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Stability Analysis & Advice */}
            <div>
              <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Stability Analysis
              </h3>
              
              <div className={`rounded-xl p-4 border mb-4 ${advice.bg}`}>
                <div className={`flex items-center gap-2 mb-2 font-bold ${advice.color}`}>
                   {advice.icon}
                   <span>{advice.level} Stability</span>
                </div>
                <p className="text-sm text-primary/90 leading-relaxed">
                  {advice.message}
                </p>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center p-3 rounded-lg bg-glass hover:bg-glass/80 transition-colors">
                  <span className="text-sm text-secondary">Jitter (Variance)</span>
                  <span className="text-sm font-medium text-primary">
                    {result.jitter} ms
                  </span>
                </div>
                 <div className="p-3 rounded-lg bg-glass hover:bg-glass/80 transition-colors">
                   <div className="text-sm text-secondary mb-2">Suitable For</div>
                   <div className="flex flex-wrap gap-2">
                     {result.downloadSpeed > 25 && <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-[10px] border border-green-500/20">4K Streaming</span>}
                     {result.stabilityScore > 80 && <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20">Competitive Gaming</span>}
                     {result.uploadSpeed > 10 && <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-[10px] border border-purple-500/20">HD Video Calls</span>}
                     {result.downloadSpeed < 10 && <span className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-[10px] border border-red-500/20">Basic Browsing</span>}
                   </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
      
      {/* AI Modal Layered on top */}
      {showAI && (
        <AIAnalysisModal 
          isOpen={showAI} 
          onClose={() => setShowAI(false)} 
          result={result} 
          onAnalysisComplete={handleAnalysisComplete}
        />
      )}
    </>
  );
};

export default ResultDetailsModal;
