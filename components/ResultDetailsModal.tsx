
import React, { useState } from 'react';
import { X, Calendar, Server, Globe, Activity, Zap, ArrowDown, ArrowUp, ShieldCheck, Smartphone, Wifi, Cable, MapPin, Router, Network, Share2, Check, Copy } from 'lucide-react';
import { TestResult } from '../types';

interface ResultDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TestResult | null;
}

const ResultDetailsModal: React.FC<ResultDetailsModalProps> = ({ isOpen, onClose, result }) => {
  const [isCopied, setIsCopied] = useState(false);

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
Ping: ${result.ping} ms | Jitter: ${result.jitter} ms | Loss: ${result.packetLoss.toFixed(1)}%
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl glass-panel rounded-2xl p-6 md:p-8 shadow-2xl border border-glassBorder animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-8 border-b border-glassBorder pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${
                result.networkType === '5G' ? 'bg-purple-500/20 text-purple-400' :
                result.networkType === 'WiFi' ? 'bg-blue-500/20 text-blue-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {result.networkType === '5G' && <Smartphone className="w-6 h-6" />}
                {result.networkType === 'WiFi' && <Wifi className="w-6 h-6" />}
                {result.networkType === 'Ethernet' && <Cable className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary">{result.networkType} Speed Test</h2>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(result.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isCopied 
                  ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' 
                  : 'bg-glass hover:bg-glass-heavy text-primary border border-glassBorder hover:border-white/20'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  {navigator.share ? <Share2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{navigator.share ? 'Share' : 'Copy Result'}</span>
                </>
              )}
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-glass text-secondary hover:text-primary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Big Speed Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-glass border border-glassBorder relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ArrowDown className="w-24 h-24 text-accent-cyan" />
            </div>
            <span className="text-sm font-mono uppercase tracking-wider text-secondary flex items-center gap-2">
              <ArrowDown className="w-4 h-4 text-accent-cyan" /> Download
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-bold text-primary">{result.downloadSpeed.toFixed(1)}</span>
              <span className="text-lg text-secondary font-medium">Mbps</span>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-glass border border-glassBorder relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ArrowUp className="w-24 h-24 text-accent-purple" />
            </div>
            <span className="text-sm font-mono uppercase tracking-wider text-secondary flex items-center gap-2">
              <ArrowUp className="w-4 h-4 text-accent-purple" /> Upload
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-bold text-primary">{result.uploadSpeed.toFixed(1)}</span>
              <span className="text-lg text-secondary font-medium">Mbps</span>
            </div>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-lg bg-surface/50 border border-glassBorder">
            <div className="text-xs text-secondary mb-1 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Ping
            </div>
            <div className="text-xl font-semibold text-primary">{result.ping} <span className="text-xs text-secondary font-normal">ms</span></div>
          </div>
          <div className="p-4 rounded-lg bg-surface/50 border border-glassBorder">
            <div className="text-xs text-secondary mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Jitter
            </div>
            <div className="text-xl font-semibold text-primary">{result.jitter} <span className="text-xs text-secondary font-normal">ms</span></div>
          </div>
          <div className="p-4 rounded-lg bg-surface/50 border border-glassBorder">
            <div className="text-xs text-secondary mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-red-400" /> Loss
            </div>
            <div className="text-xl font-semibold text-primary">{result.packetLoss.toFixed(1)} <span className="text-xs text-secondary font-normal">%</span></div>
          </div>
          <div className="p-4 rounded-lg bg-surface/50 border border-glassBorder">
            <div className="text-xs text-secondary mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Score
            </div>
            <div className="text-xl font-semibold text-primary">{result.consistencyScore} <span className="text-xs text-secondary font-normal">/100</span></div>
          </div>
        </div>

        {/* Context Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest border-b border-glassBorder pb-2">Server Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-secondary flex items-center gap-2"><Server className="w-4 h-4" /> Location</span>
                <span className="text-sm font-medium text-primary">{result.serverLocation}</span>
              </div>
              {result.provider && (
                <div className="flex justify-between">
                  <span className="text-sm text-secondary flex items-center gap-2"><Network className="w-4 h-4" /> Provider</span>
                  <span className="text-sm font-medium text-primary">{result.provider}</span>
                </div>
              )}
            </div>
          </div>

          {result.clientInfo && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-secondary uppercase tracking-widest border-b border-glassBorder pb-2">Client Info</h3>
              <div className="space-y-3">
                 <div className="flex justify-between">
                  <span className="text-sm text-secondary flex items-center gap-2"><Router className="w-4 h-4" /> ISP</span>
                  <span className="text-sm font-medium text-primary">{result.clientInfo.isp}</span>
                </div>
                 <div className="flex justify-between">
                  <span className="text-sm text-secondary flex items-center gap-2"><Globe className="w-4 h-4" /> IP</span>
                  <span className="text-sm font-medium text-primary">{result.clientInfo.ip}</span>
                </div>
                 <div className="flex justify-between">
                  <span className="text-sm text-secondary flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</span>
                  <span className="text-sm font-medium text-primary flex items-center gap-2">
                    {result.clientInfo.flagUrl && <img src={result.clientInfo.flagUrl} alt="flag" className="w-4 h-auto rounded-sm" />}
                    {result.clientInfo.city}, {result.clientInfo.country}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ResultDetailsModal;
