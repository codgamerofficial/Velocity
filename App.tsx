
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  Activity,
  Wifi,
  ArrowDown,
  ArrowUp,
  Globe,
  ShieldCheck,
  Zap,
  Clock,
  Play,
  Settings2,
  Smartphone,
  Cable,
  Info,
  Sun,
  Moon,
  Signal,
  Scale,
  Copy,
  Check,
  Database,
  FileJson,
  Map as MapIcon,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { NetworkSimulationEngine } from './services/simulationEngine';
import { fetchClientInfo, getBrowserNetworkEstimates } from './services/realNetwork';
import { TestPhase, EngineState, TestResult, ClientInfo } from './types';
import { THROTTLING_PRESETS, SERVER_LOCATIONS } from './constants';
import Speedometer from './components/Speedometer';
import LiveChart from './components/LiveChart';
import LatencyChart from './components/LatencyChart';
import PacketLossChart from './components/PacketLossChart';
import StatCard from './components/StatCard';
import InfoModal from './components/InfoModal';
import ResultDetailsModal from './components/ResultDetailsModal';
import CoverageMapModal from './components/CoverageMapModal';
import AnimatedBackground from './components/AnimatedBackground';
import ConfettiEffect from './components/ConfettiEffect';

// Helper to get Brand Colors/Logo Data
// Moved outside component for stability and performance
const getProviderLogoData = (name: string) => {
  const normalized = (name || '').toLowerCase();
  let data = { bg: '334155', color: 'cbd5e1', text: (name && name.length >= 2) ? name.substring(0, 2).toUpperCase() : 'UK' };

  // Map common providers to their brand colors and short text
  if (normalized.includes('jio')) data = { bg: '0f52ba', color: 'fff', text: 'Jio' };
  else if (normalized.includes('airtel')) data = { bg: 'ff0000', color: 'fff', text: 'Airtel' };
  else if (normalized.includes('verizon')) data = { bg: 'cd040b', color: 'fff', text: 'VZ' };
  else if (normalized.includes('at&t')) data = { bg: '00a8e0', color: 'fff', text: 'AT&T' };
  else if (normalized.includes('comcast') || normalized.includes('xfinity')) data = { bg: '7b4397', color: 'fff', text: 'Xfinity' };
  else if (normalized.includes('spectrum') || normalized.includes('charter')) data = { bg: '005da6', color: 'fff', text: 'Spectrum' };
  else if (normalized.includes('vodafone') || normalized === 'vi' || normalized.includes('vi ')) data = { bg: 'e60000', color: 'fff', text: 'Vi' };
  else if (normalized.includes('bsnl')) data = { bg: '008000', color: 'fff', text: 'BSNL' };
  else if (normalized.includes('act')) data = { bg: 'ed1c24', color: 'fff', text: 'ACT' };
  else if (normalized.includes('hathway')) data = { bg: '0066cc', color: 'fff', text: 'Hath' };
  else if (normalized.includes('tataplay') || normalized.includes('tata play')) data = { bg: 'da1c5c', color: 'fff', text: 'Tata' };
  else if (normalized.includes('excitel')) data = { bg: 'ff0000', color: 'fff', text: 'Exci' };
  else if (normalized.includes('you')) data = { bg: 'ffcc00', color: '000', text: 'YOU' };
  else if (normalized.includes('gtpl')) data = { bg: '0066cc', color: 'fff', text: 'GTPL' };
  else if (normalized.includes('google')) data = { bg: '4285F4', color: 'fff', text: 'Google' };
  else if (normalized.includes('t-mobile')) data = { bg: 'ea0a8e', color: 'fff', text: 'T-Mo' };
  else if (normalized.includes('orange')) data = { bg: 'ff7900', color: 'fff', text: 'Orange' };
  else if (normalized.includes('starlink')) data = { bg: '000000', color: 'fff', text: 'Star' };
  else if (normalized.includes('centurylink') || normalized.includes('lumen')) data = { bg: '009f4d', color: 'fff', text: 'Lumen' };
  else if (normalized.includes('frontier')) data = { bg: 'ff0037', color: 'fff', text: 'Frontier' };
  else if (normalized.includes('cox')) data = { bg: '00549f', color: 'fff', text: 'Cox' };
  else if (normalized.includes('rogers')) data = { bg: 'da291c', color: 'fff', text: 'Rogers' };
  else if (normalized.includes('bell')) data = { bg: '00388d', color: 'fff', text: 'Bell' };
  else if (normalized.includes('telus')) data = { bg: '4b2882', color: 'fff', text: 'Telus' };
  else if (normalized.includes('bt') || normalized.includes('british telecom')) data = { bg: '5514b4', color: 'fff', text: 'BT' };
  else if (normalized.includes('virgin')) data = { bg: 'e10a0a', color: 'fff', text: 'Virgin' };
  else if (normalized.includes('sky')) data = { bg: 'ea0a8e', color: 'fff', text: 'Sky' };
  else if (normalized.includes('telekom') || normalized.includes('deutsche')) data = { bg: 'e20074', color: 'fff', text: 'Tele' };

  return {
    ...data,
    url: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.text)}&background=${data.bg}&color=${data.color}&size=64&bold=true&font-size=0.45&rounded=true`
  };
};

// Helper to calculate Overall Network Health based on metrics
// Updated with Theme-Aware Classes (Dark/Light support)
const getNetworkHealth = (ping: number | null, jitter: number | null, loss: number | null) => {
  if (ping === null || jitter === null) {
    return {
      label: 'System Ready',
      color: 'text-secondary',
      barColor: 'bg-secondary',
      level: 0,
      border: 'border-black/5 dark:border-white/5',
      bg: 'bg-black/5 dark:bg-white/5'
    };
  }

  const p = ping || 0;
  const j = jitter || 0;
  const l = loss || 0;

  // Grading Logic
  // Poor: High packet loss (>2%) OR very high latency (>150ms) OR extreme jitter (>30ms)
  if (l > 2 || p > 150 || j > 30) {
    return {
      label: 'Poor Quality',
      color: 'text-red-600 dark:text-red-400',
      barColor: 'bg-red-500 dark:bg-red-400',
      level: 1,
      border: 'border-red-500/20',
      bg: 'bg-red-500/10'
    };
  }
  // Fair: Slight packet loss OR high latency (>80ms) OR moderate jitter (>15ms)
  if (l > 0.5 || p > 80 || j > 15) {
    return {
      label: 'Fair Quality',
      color: 'text-yellow-600 dark:text-yellow-400',
      barColor: 'bg-yellow-500 dark:bg-yellow-400',
      level: 2,
      border: 'border-yellow-500/20',
      bg: 'bg-yellow-500/10'
    };
  }
  // Good: Reasonable latency (>40ms) or slight jitter (>5ms)
  if (p > 40 || j > 5) {
    return {
      label: 'Good Quality',
      color: 'text-blue-600 dark:text-blue-400',
      barColor: 'bg-blue-500 dark:bg-blue-400',
      level: 3,
      border: 'border-blue-500/20',
      bg: 'bg-blue-500/10'
    };
  }
  // Excellent: Low latency, minimal jitter, no loss
  return {
    label: 'Excellent',
    color: 'text-green-600 dark:text-green-400',
    barColor: 'bg-green-500 dark:bg-green-400',
    level: 4,
    border: 'border-green-500/20',
    bg: 'bg-green-500/10'
  };
};

const App: React.FC = () => {
  const [engineState, setEngineState] = useState<EngineState>({
    phase: TestPhase.IDLE,
    currentSpeed: 0,
    progress: 0,
    ping: null,
    jitter: null,
    packetLoss: null,
    stabilityScore: 100,
    downloadPeak: 0,
    uploadPeak: 0,
    graphData: [],
    downloadGraphData: [],
    uploadGraphData: [],
    pingGraphData: [],
    packetLossData: []
  });

  const [history, setHistory] = useState<TestResult[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [openWithAI, setOpenWithAI] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Initialize throttling limit from local storage
  const [throttlingLimit, setThrottlingLimit] = useState<number | null>(() => {
    try {
      const savedId = localStorage.getItem('velocity_throttling_id');
      const preset = THROTTLING_PRESETS.find(p => p.id === savedId);
      return preset ? preset.limit : null;
    } catch {
      return null;
    }
  });

  const [networkType, setNetworkType] = useState<'WiFi' | 'Ethernet' | '5G'>('WiFi');

  // Initialize server selection from local storage
  const [selectedServer, setSelectedServer] = useState(() => {
    try {
      const savedId = localStorage.getItem('velocity_server_id');
      const found = SERVER_LOCATIONS.find(s => s.id === savedId);
      return found || SERVER_LOCATIONS[0];
    } catch {
      return SERVER_LOCATIONS[0];
    }
  });

  const [providerName, setProviderName] = useState<string>('Detecting...');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [isDataSaver, setIsDataSaver] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const engineRef = useRef<NetworkSimulationEngine | null>(null);

  // Keep track of latest configuration to avoid stale closures in callbacks
  const configRef = useRef({ networkType, selectedServer, providerName, clientInfo, isDataSaver });

  useEffect(() => {
    configRef.current = { networkType, selectedServer, providerName, clientInfo, isDataSaver };
  }, [networkType, selectedServer, providerName, clientInfo, isDataSaver]);

  // Persist preferences
  useEffect(() => {
    try {
      const preset = THROTTLING_PRESETS.find(p => p.limit === throttlingLimit);
      const id = preset ? preset.id : 'native';
      localStorage.setItem('velocity_throttling_id', id);
    } catch (e) {
      // Ignore storage errors
    }
  }, [throttlingLimit]);

  useEffect(() => {
    try {
      if (selectedServer?.id) {
        localStorage.setItem('velocity_server_id', selectedServer.id);
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, [selectedServer]);

  // Load Real Client Info on Mount and Autodetect Provider/Network Type
  useEffect(() => {
    // 1. Try native browser API for immediate network type detection
    const est = getBrowserNetworkEstimates();
    let browserDetectedType: 'WiFi' | 'Ethernet' | '5G' | null = null;

    if (est && est.type && est.type !== 'unknown') {
      if (est.type === 'cellular') browserDetectedType = '5G';
      else if (est.type === 'wifi') browserDetectedType = 'WiFi';
      else if (est.type === 'ethernet') browserDetectedType = 'Ethernet';

      if (browserDetectedType) {
        setNetworkType(browserDetectedType);
      }
    }

    // 2. Fetch detailed IP info for Provider Name and fallback detection
    fetchClientInfo().then(info => {
      if (info) {
        setClientInfo(info);

        // Auto-detect Provider Name
        if (info.isp) {
          setProviderName(info.isp);
        }

        // If browser API didn't return a specific type (or is unsupported), infer from ISP name
        if (!browserDetectedType) {
          const isp = (info.isp || '').toLowerCase();
          const org = (info.org || '').toLowerCase();
          const fullString = `${isp} ${org}`;

          // Explicit Fixed Line keywords (Fiber/Broadband/Cable/DSL)
          const fixedKeywords = [
            'fiber', 'fibernet', 'broadband', 'cable', 'dsl', 'ftth',
            'act', 'hathway', 'excitel', 'gtpl', 'you broadband',
            'tata play', 'xfinity', 'comcast', 'spectrum', 'charter',
            'alliance', 'spectranet', 'tikona', 'railwire', 'bsnl broadband',
            'verizon fios', 'at&t internet', 'centurylink', 'frontier'
          ];

          // Explicit Mobile keywords
          const mobileKeywords = [
            'mobile', 'cellular', 'wireless', 'lte', 'gsm', '3g', '4g', '5g', 'gprs',
            't-mobile', 'verizon wireless', 'at&t mobility', 'google fi', 'mint mobile'
          ];

          // Ambiguous Providers (Major Telcos) - default to Mobile if "fiber" is absent
          // These are providers that primarily started as mobile or have massive mobile user bases
          // If the ISP string is just "Reliance Jio" or "Bharti Airtel" without "Fiber", it's often mobile data hotspot or direct.
          const telcoKeywords = ['jio', 'airtel', 'vi', 'vodafone', 'idea', 'bsnl', 'mtnl', 'o2', 'ee', 'three'];

          const isFixed = fixedKeywords.some(k => fullString.includes(k));
          const isExplicitMobile = mobileKeywords.some(k => fullString.includes(k));
          const isTelco = telcoKeywords.some(k => fullString.includes(k));

          if (isFixed) {
            setNetworkType('WiFi'); // Most desktop/laptop users on fixed lines use WiFi
          } else if (isExplicitMobile) {
            setNetworkType('5G');
          } else if (isTelco) {
            // Heuristic: If it's a major telco and didn't explicitly say "fiber", assume mobile network
            setNetworkType('5G');
          } else {
            // Default fallback for generic ISPs or Corporate networks
            setNetworkType('WiFi');
          }
        }
      } else {
        setProviderName('Unknown Provider');
      }
    });
  }, []);

  // Theme Effect
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Derived state for displaying details
  const selectedTest = useMemo(() => {
    return history.find(h => h.id === selectedResultId) || null;
  }, [history, selectedResultId]);

  const handleEngineUpdate = useCallback((newState: EngineState) => {
    setEngineState(newState);
  }, []);

  const handleComplete = useCallback((finalState: Partial<EngineState>) => {
    const { networkType: currentNetwork, selectedServer: currentServer, providerName: currentProvider, clientInfo: currentClient, isDataSaver: currentDataSaver } = configRef.current;

    // Heuristic for Wi-Fi 6E: fast speeds on WiFi
    const isWifi6E = currentNetwork === 'WiFi' && (finalState.downloadPeak || 0) > 800;

    const newResult: TestResult = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ping: finalState.ping || 0,
      jitter: finalState.jitter || 0,
      packetLoss: finalState.packetLoss || 0,
      downloadSpeed: finalState.downloadPeak || 0,
      uploadSpeed: finalState.uploadPeak || 0,
      stabilityScore: finalState.stabilityScore || 0,
      consistencyScore: finalState.stabilityScore || 0, // Mapping stability to consistency
      serverLocation: `${currentServer.name} (${currentServer.region})`,
      networkType: currentNetwork,
      provider: currentProvider,
      clientInfo: currentClient || undefined,
      isDataSaver: currentDataSaver,
      isWifi6E: isWifi6E
    };
    setHistory(prev => [newResult, ...prev]);
    setSelectedResultId(newResult.id);
    setOpenWithAI(false);
    setShowResultModal(true);

    // Trigger confetti for excellent results
    const ping = finalState.ping || 0;
    const downloadSpeed = finalState.downloadPeak || 0;
    if (ping < 30 && downloadSpeed > 100) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, []);

  const handleUpdateResult = useCallback((id: string, updates: Partial<TestResult>) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const startTest = () => {
    setSelectedResultId(null);
    if (!engineRef.current) {
      engineRef.current = new NetworkSimulationEngine(handleEngineUpdate, handleComplete);
    }
    // Pass the base latency and data saver flag
    engineRef.current.start(throttlingLimit, selectedServer.baseLatency, isDataSaver);
  };

  const stopTest = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
  };

  const handleExportAllHistory = () => {
    if (history.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `velocity_history_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleCopyInfo = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // Helper to determine display details for Network Type
  // Updated to use theme-aware text colors
  const getNetworkDisplay = () => {
    if (networkType === 'Ethernet') {
      return {
        icon: <Cable className="w-3.5 h-3.5" />,
        label: 'ETHERNET',
        badge: null,
        style: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 shadow-green-500/20'
      };
    }
    if (networkType === 'WiFi') {
      // Heuristic check for "Wi-Fi 6E" visual based on recent history or current high speed
      const hasWifi6E = history.some(h => h.networkType === 'WiFi' && h.isWifi6E) || (engineState.downloadPeak > 800);

      return {
        icon: <Wifi className="w-3.5 h-3.5" />,
        label: 'WI-FI',
        badge: hasWifi6E ? '6E' : null,
        style: hasWifi6E
          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shadow-cyan-500/20'
          : 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-blue-500/20'
      };
    }
    // 5G / Cellular
    const is5G = providerName.toLowerCase().includes('5g') || (clientInfo?.isp || '').toLowerCase().includes('5g');
    return {
      icon: <Signal className="w-3.5 h-3.5" />,
      label: is5G ? '5G NR' : '4G LTE',
      badge: null,
      style: 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 shadow-purple-500/20'
    };
  };

  const logoData = getProviderLogoData(providerName);

  // Determine if we are active
  const isActive = engineState.phase !== TestPhase.IDLE && engineState.phase !== TestPhase.COMPLETE;

  // Calculate dynamic max speed for the meter based on real measurements
  const speedometerMax = useMemo(() => {
    if (engineState.downloadPeak > 500) return 2000;
    if (engineState.downloadPeak > 100) return 500;
    if (engineState.downloadPeak > 0) return Math.ceil(engineState.downloadPeak * 1.5 / 10) * 10;
    if (throttlingLimit === null) return 1000;
    return Math.ceil((throttlingLimit * 1.33) / 50) * 50;
  }, [throttlingLimit, engineState.downloadPeak]);

  const netDisplay = getNetworkDisplay();

  // Determine Stability Color
  const getStabilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Calculate dynamic health status
  const healthMetrics = useMemo(() => {
    if (engineState.phase !== TestPhase.IDLE) {
      return { p: engineState.ping, j: engineState.jitter, l: engineState.packetLoss };
    }
    if (history.length > 0) {
      return { p: history[0].ping, j: history[0].jitter, l: history[0].packetLoss };
    }
    return { p: null, j: null, l: null };
  }, [engineState.phase, engineState.ping, engineState.jitter, engineState.packetLoss, history]);

  const healthStatus = getNetworkHealth(healthMetrics.p, healthMetrics.j, healthMetrics.l);

  return (
    <div className="min-h-screen bg-surface text-primary font-sans selection:bg-accent-cyan selection:text-black transition-colors duration-300">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Confetti Effect */}
      <ConfettiEffect trigger={showConfetti} />

      {/* Header */}
      {/* Header */}
      <header className="fixed top-0 w-full z-[100] border-b border-glassBorder bg-surface/80 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-accent-cyan w-6 h-6" />
            <h1 className="font-bold text-xl tracking-tight">Velocity <span className="hidden sm:inline text-xs font-normal text-secondary px-2 py-0.5 rounded border border-glassBorder bg-glass">PRO</span></h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4 text-xs font-mono text-secondary">
              {/* Data Saver Toggle */}
              <button
                onClick={() => !isActive && setIsDataSaver(!isDataSaver)}
                disabled={isActive}
                className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded border transition-all ${isDataSaver
                  ? 'bg-accent-green/10 border-accent-green/30 text-accent-green'
                  : 'border-transparent hover:bg-glass text-secondary'
                  } disabled:opacity-50`}
                title="Run shorter tests to save data"
              >
                <Database className="w-3 h-3" />
                <span>Data Saver</span>
              </button>

              <div className="h-4 w-px bg-glassBorder hidden sm:block"></div>

              {/* Network Status & Signal Strength Indicator */}
              <div className={`hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full border ${healthStatus.border} ${healthStatus.bg} transition-all duration-500 group relative`}>

                {/* Network Type & Icon */}
                <div className="flex items-center gap-2 pr-3 border-r border-current opacity-20">
                  <span className={healthStatus.color}>{netDisplay.icon}</span>
                  <span className={`text-xs font-bold tracking-wide ${healthStatus.color}`}>{netDisplay.label}</span>
                </div>

                {/* Signal Bars */}
                <div className="flex items-end gap-0.5 h-3">
                  {[1, 2, 3, 4].map(bar => (
                    <div
                      key={bar}
                      className={`w-1 rounded-[1px] transition-all duration-500 ${bar <= healthStatus.level ? healthStatus.barColor : 'bg-current opacity-20'}`}
                      style={{ height: `${bar * 25}%` }}
                    />
                  ))}
                </div>

                <div className="flex flex-col leading-none">
                  <span className="text-[9px] text-secondary font-medium uppercase tracking-wider mb-0.5">Signal</span>
                  <span className={`text-xs font-bold ${healthStatus.color}`}>{healthStatus.label}</span>
                </div>

                {/* Detailed Tooltip on Hover */}
                {healthStatus.level > 0 && (
                  <div className="absolute top-full right-0 mt-2 w-48 p-3 rounded-xl bg-panel/95 backdrop-blur-xl border border-glassBorder shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none transform translate-y-1 group-hover:translate-y-0 z-50">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-secondary">Ping</span>
                        <span className={`font-mono ${healthMetrics.p! > 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-primary'}`}>{healthMetrics.p} ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-secondary">Jitter</span>
                        <span className={`font-mono ${healthMetrics.j! > 10 ? 'text-yellow-600 dark:text-yellow-400' : 'text-primary'}`}>{healthMetrics.j} ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-secondary">Loss</span>
                        <span className={`font-mono ${healthMetrics.l! > 0 ? 'text-red-600 dark:text-red-400' : 'text-primary'}`}>{healthMetrics.l?.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
                {isActive ? 'LIVE' : 'READY'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* New Map Button */}
              <button
                onClick={() => setShowMap(true)}
                className="p-2 rounded-full hover:bg-glass text-secondary hover:text-primary transition-colors border border-transparent hover:border-glassBorder"
                aria-label="Open Map"
                title="Network Coverage Map"
              >
                <MapIcon className="w-5 h-5" />
              </button>

              {/* Enhanced Theme Switcher */}
              <button
                onClick={toggleTheme}
                className="relative p-2 rounded-full hover:bg-glass text-secondary hover:text-primary transition-colors border border-transparent hover:border-glassBorder overflow-hidden"
                aria-label="Toggle Theme"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <div className="relative w-5 h-5">
                  <Sun className={`w-5 h-5 absolute inset-0 transition-all duration-500 transform ${theme === 'dark' ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`} />
                  <Moon className={`w-5 h-5 absolute inset-0 transition-all duration-500 transform ${theme === 'light' ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'}`} />
                </div>
              </button>

              <button
                onClick={() => setShowInfo(true)}
                className="p-2 rounded-full hover:bg-glass text-secondary hover:text-primary transition-colors border border-transparent hover:border-glassBorder"
                aria-label="Information"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-12 px-4 sm:px-6 flex-grow flex flex-col justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Controls & Main Display */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Main Hero Card - Updated to prevent clipping of tooltips */}
            <div className="glass-panel rounded-2xl border border-glassBorder relative group">
              {/* Decorative Gradient Blob in clipped container */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-cyan/5 rounded-full blur-[100px] group-hover:bg-accent-cyan/10 transition-all duration-1000" />
              </div>

              {/* Content Container - Visible Overflow for Tooltips */}
              <div className="p-8 flex flex-col items-center justify-center relative z-10 min-h-[400px]">

                {/* MOVED BUTTON HERE */}
                <div className="mb-8 flex flex-col items-center w-full relative z-50">
                  {isActive ? (
                    <motion.button
                      onClick={stopTest}
                      className="group relative px-8 py-3 rounded-full bg-red-500/10 border border-red-500/50 text-red-500 font-bold tracking-wide hover:bg-red-500/20 transition-all overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-sm animate-spin" />
                        STOP TEST
                      </span>
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={startTest}
                      className="group relative px-12 py-5 rounded-full bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-cyan bg-[length:200%_auto] text-white font-display font-bold text-lg tracking-widest overflow-hidden"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 40px rgba(0, 212, 255, 0.6), 0 0 60px rgba(157, 108, 255, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      transition={{
                        backgroundPosition: {
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                      <motion.span
                        className="relative z-10 flex items-center gap-2"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Play className="w-5 h-5 fill-current" />
                        START TEST
                      </motion.span>
                    </motion.button>
                  )}
                </div>

                <Speedometer
                  speed={engineState.currentSpeed}
                  phase={engineState.phase}
                  max={speedometerMax}
                  limit={throttlingLimit}
                />

                <div className="mt-8 flex flex-col items-center w-full">

                  {/* Settings Controls */}
                  <div className={`relative z-20 mb-8 flex flex-col gap-4 items-center transition-opacity duration-500 ${isActive ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>

                    {/* Auto-Detected Provider Info with Hover Details */}
                    <div className="group relative flex flex-col items-center gap-2 mb-2 z-30">

                      {/* Network Type Badge */}
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 shadow-lg cursor-help group-hover:scale-105 ${netDisplay.style}`}>
                        {netDisplay.icon}
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold tracking-wider uppercase">{netDisplay.label}</span>
                          {netDisplay.badge && (
                            <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[9px] font-extrabold tracking-tight shadow-sm border border-white/10">
                              {netDisplay.badge}
                            </span>
                          )}
                        </div>
                        {clientInfo && <Info className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />}
                      </div>

                      {/* Provider Name & Logo Display */}
                      <div className="flex items-center justify-center gap-2 mt-1">
                        {/* Branded Logo */}
                        <img
                          src={logoData.url}
                          alt={providerName}
                          className="w-6 h-6 rounded-full shadow-sm border border-glassBorder bg-white/10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />

                        <div className="flex flex-col items-start leading-none">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-primary tracking-tight">
                              {providerName}
                            </span>
                            <div className={`w-1.5 h-1.5 rounded-full ${clientInfo ? 'bg-accent-green shadow-[0_0_5px_rgba(16,185,129,0.6)]' : 'bg-yellow-500 animate-pulse'}`}></div>
                          </div>
                          {clientInfo && (
                            <span className="text-[10px] text-secondary mt-1">
                              {clientInfo.city}, {clientInfo.country}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Hover Tooltip - Now visible due to removed overflow-hidden on parent */}
                      {clientInfo && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 p-0 rounded-xl bg-panel/95 backdrop-blur-xl border border-glassBorder shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none transform translate-y-2 group-hover:translate-y-0 overflow-hidden z-50">
                          {/* Tooltip Header */}
                          <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Globe className="w-3 h-3 text-accent-cyan" />
                              <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-widest">Client Details</span>
                            </div>
                            {clientInfo.flagUrl && <img src={clientInfo.flagUrl} alt="flag" className="w-5 h-auto object-cover rounded-[2px]" />}
                          </div>

                          {/* Tooltip Content */}
                          <div className="p-4 space-y-3 text-xs">
                            <div className="grid grid-cols-[min-content_1fr] gap-x-4 gap-y-2">

                              <span className="text-secondary font-medium whitespace-nowrap">Provider</span>
                              <span className="text-primary font-medium text-right truncate">{clientInfo.isp}</span>

                              <span className="text-secondary font-medium whitespace-nowrap">Location</span>
                              <span className="text-primary font-medium text-right truncate">{clientInfo.city}, {clientInfo.region}</span>

                              <div className="col-span-2 h-px bg-white/5 my-1"></div>

                              <span className="text-secondary font-medium whitespace-nowrap">IP Address</span>
                              <div className="flex items-center justify-end gap-2 overflow-hidden">
                                <span className="text-primary font-mono text-right truncate">{clientInfo.ip}</span>
                                <button onClick={() => handleCopyInfo(clientInfo.ip)} className="p-1 hover:bg-white/10 rounded pointer-events-auto">
                                  {isCopied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-secondary" />}
                                </button>
                              </div>

                              {clientInfo.asn && (
                                <>
                                  <span className="text-secondary font-medium whitespace-nowrap">ASN</span>
                                  <span className="text-primary font-mono text-right">{clientInfo.asn}</span>
                                </>
                              )}

                              {clientInfo.org && clientInfo.org !== clientInfo.isp && (
                                <>
                                  <span className="text-secondary font-medium whitespace-nowrap">Organization</span>
                                  <span className="text-primary font-medium text-right truncate">{clientInfo.org}</span>
                                </>
                              )}

                              <span className="text-secondary font-medium whitespace-nowrap">Timezone</span>
                              <span className="text-primary font-medium text-right">{clientInfo.timezone || 'UTC'}</span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-8 border-transparent border-t-panel/95 opacity-95"></div>
                        </div>
                      )}
                    </div>

                    {/* Server Selection */}
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium text-secondary uppercase tracking-wider w-20 text-right flex items-center justify-end gap-2">
                        <Globe className="w-3 h-3" /> Server
                      </label>
                      <select
                        value={selectedServer.id}
                        onChange={(e) => {
                          const s = SERVER_LOCATIONS.find(loc => loc.id === e.target.value);
                          if (s) setSelectedServer(s);
                        }}
                        className="bg-glass border border-glassBorder rounded px-3 py-1.5 text-sm text-primary focus:outline-none focus:border-accent-cyan transition-colors w-48"
                      >
                        {SERVER_LOCATIONS.map(loc => (
                          <option key={loc.id} value={loc.id} className="bg-panel text-primary">
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Throttle Selection */}
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium text-secondary uppercase tracking-wider w-20 text-right flex items-center justify-end gap-2">
                        <Settings2 className="w-3 h-3" /> Limit
                      </label>
                      <select
                        value={throttlingLimit === null ? 'native' : THROTTLING_PRESETS.find(p => p.limit === throttlingLimit)?.id || 'native'}
                        onChange={(e) => {
                          const preset = THROTTLING_PRESETS.find(p => p.id === e.target.value);
                          setThrottlingLimit(preset ? preset.limit : null);
                        }}
                        className="bg-glass border border-glassBorder rounded px-3 py-1.5 text-sm text-primary focus:outline-none focus:border-accent-cyan transition-colors w-48"
                      >
                        {THROTTLING_PRESETS.map(preset => (
                          <option key={preset.id} value={preset.id} className="bg-panel text-primary">
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                label="Ping"
                value={engineState.ping}
                unit="ms"
                icon={<Zap className="w-4 h-4" />}
                color="text-accent-yellow"
              />
              <StatCard
                label="Jitter"
                value={engineState.jitter}
                unit="ms"
                icon={<Activity className="w-4 h-4" />}
              />
              {/* Stability Score Card - Featured */}
              <div className="md:col-span-1 md:row-span-2 flex">
                <div className="w-full glass-panel p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-glass border border-glassBorder relative overflow-hidden group">
                  <div className={`absolute inset-0 opacity-10 ${getStabilityColor(engineState.stabilityScore)} bg-current blur-xl group-hover:opacity-20 transition-opacity`}></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-mono uppercase tracking-wider text-secondary">Stability</span>
                    </div>
                    <div className={`text-5xl font-bold tabular-nums ${getStabilityColor(engineState.stabilityScore)} drop-shadow-sm`}>
                      {engineState.stabilityScore}
                    </div>
                    <div className="text-[10px] text-secondary font-medium uppercase tracking-wide mt-1">
                      {engineState.stabilityScore >= 90 ? 'Excellent' : engineState.stabilityScore >= 70 ? 'Good' : 'Unstable'}
                    </div>
                  </div>
                </div>
              </div>
              <StatCard
                label="Download"
                value={engineState.downloadPeak > 0 ? engineState.downloadPeak : null}
                unit="Mbps"
                icon={<ArrowDown className="w-4 h-4" />}
                color="text-accent-cyan"
              />
              <StatCard
                label="Upload"
                value={engineState.uploadPeak > 0 ? engineState.uploadPeak : null}
                unit="Mbps"
                icon={<ArrowUp className="w-4 h-4" />}
                color="text-accent-purple"
              />
            </div>

          </div>

          {/* Right Column: Analytics */}
          <div className="lg:col-span-7 space-y-6">

            {/* Throughput Chart */}
            <div className="glass-panel rounded-xl border border-glassBorder overflow-hidden">
              <LiveChart
                downloadData={engineState.downloadGraphData}
                uploadData={engineState.uploadGraphData}
                phase={engineState.phase}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Latency Chart */}
              <div className="glass-panel rounded-xl border border-glassBorder overflow-hidden">
                <LatencyChart data={engineState.pingGraphData} />
              </div>

              {/* Packet Loss Chart */}
              <div className="glass-panel rounded-xl border border-glassBorder overflow-hidden">
                <div className="px-6 py-2 flex items-center justify-between text-xs font-mono border-b border-glassBorder/50">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-accent-red" />
                    <span className="text-secondary">PACKET LOSS</span>
                  </div>
                  <div className="text-accent-red/80 text-[10px] uppercase">
                    Stability
                  </div>
                </div>
                <PacketLossChart data={engineState.packetLossData} phase={engineState.phase} />
              </div>
            </div>

            {/* Recent History */}
            <div className="glass-panel rounded-xl border border-glassBorder p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Recent Tests
                </h3>
                {history.length > 0 && (
                  <button
                    onClick={handleExportAllHistory}
                    className="flex items-center gap-1.5 text-xs font-medium text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                  >
                    <FileJson className="w-3 h-3" />
                    Export JSON
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-secondary text-sm">
                    No tests run yet. Start a test to see results.
                  </div>
                ) : (
                  history.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 rounded-lg bg-glass border border-glassBorder hover:border-primary/20 transition-all group flex items-center justify-between"
                    >
                      <div
                        onClick={() => {
                          setSelectedResultId(result.id);
                          setOpenWithAI(false);
                          setShowResultModal(true);
                        }}
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                      >
                        <div className={`p-2 rounded-md ${result.networkType === 'WiFi' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : result.networkType === '5G' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                          {result.networkType === 'WiFi' ? <Wifi className="w-4 h-4" /> : result.networkType === '5G' ? <Smartphone className="w-4 h-4" /> : <Cable className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-bold text-primary">{result.downloadSpeed.toFixed(1)} <span className="text-[10px] font-normal text-secondary">Mbps</span></div>
                            {result.isWifi6E && <span className="text-[9px] font-bold bg-accent-cyan/10 text-accent-cyan px-1 rounded border border-accent-cyan/20">6E</span>}
                          </div>
                          <div className="text-[10px] text-secondary">{new Date(result.timestamp).toLocaleTimeString()} • {result.serverLocation.split('(')[0]}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right">
                        <div className="hidden sm:block">
                          <div className="text-xs font-medium text-primary">{result.ping} <span className="text-[10px] text-secondary">ms</span></div>
                          <div className="text-[10px] text-secondary">Ping</div>
                        </div>
                        <div className="hidden sm:block">
                          <div className={`text-xs font-medium ${result.stabilityScore >= 90 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                            {result.stabilityScore}/100
                          </div>
                          <div className="text-[10px] text-secondary">Stability</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedResultId(result.id);
                              setOpenWithAI(true);
                              setShowResultModal(true);
                            }}
                            className="p-2 rounded-full hover:bg-accent-purple/10 text-secondary hover:text-accent-purple transition-colors"
                            title="Generate AI Report"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedResultId(result.id);
                              setOpenWithAI(false);
                              setShowResultModal(true);
                            }}
                            className="p-2 rounded-full hover:bg-glass text-secondary hover:text-primary transition-colors"
                          >
                            <ArrowDown className="w-4 h-4 -rotate-90" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Modals */}
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
      <ResultDetailsModal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          setOpenWithAI(false);
        }}
        result={selectedTest}
        onUpdateResult={handleUpdateResult}
        startWithAI={openWithAI}
      />
      <CoverageMapModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
      />
    </div>
  );
};

export default App;
