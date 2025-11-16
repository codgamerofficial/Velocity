
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
  BarChart3,
  Play,
  RotateCcw,
  Settings2,
  Smartphone,
  Cable,
  Info,
  Sun,
  Moon,
  Signal,
  MapPin,
  Router,
  Network
} from 'lucide-react';
import { NetworkSimulationEngine } from './services/simulationEngine';
import { fetchClientInfo, getBrowserNetworkEstimates } from './services/realNetwork';
import { TestPhase, EngineState, TestResult, ClientInfo } from './types';
import { THROTTLING_PRESETS, SERVER_LOCATIONS, INDIAN_CARRIERS, INDIAN_ISPS } from './constants';
import Speedometer from './components/Speedometer';
import LiveChart from './components/LiveChart';
import LatencyChart from './components/LatencyChart';
import PacketLossChart from './components/PacketLossChart';
import StatCard from './components/StatCard';
import InfoModal from './components/InfoModal';
import ResultDetailsModal from './components/ResultDetailsModal';

const App: React.FC = () => {
  const [engineState, setEngineState] = useState<EngineState>({
    phase: TestPhase.IDLE,
    currentSpeed: 0,
    progress: 0,
    ping: null,
    jitter: null,
    packetLoss: null,
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
  const [throttlingLimit, setThrottlingLimit] = useState<number | null>(null);
  const [networkType, setNetworkType] = useState<'WiFi' | 'Ethernet' | '5G'>('WiFi');
  const [selectedServer, setSelectedServer] = useState(SERVER_LOCATIONS[0]);
  const [providerName, setProviderName] = useState<string>('Detecting...');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);

  const engineRef = useRef<NetworkSimulationEngine | null>(null);
  
  // Keep track of latest configuration to avoid stale closures in callbacks
  const configRef = useRef({ networkType, selectedServer, providerName, clientInfo });
  useEffect(() => {
    configRef.current = { networkType, selectedServer, providerName, clientInfo };
  }, [networkType, selectedServer, providerName, clientInfo]);

  // Load Real Client Info on Mount and Autodetect Provider/Network Type
  useEffect(() => {
    // 1. Try native browser API for immediate network type detection
    const est = getBrowserNetworkEstimates();
    if (est && est.type) {
      if (est.type === 'cellular') setNetworkType('5G');
      else if (est.type === 'wifi') setNetworkType('WiFi');
      else if (est.type === 'ethernet') setNetworkType('Ethernet');
    }

    // 2. Fetch detailed IP info for Provider Name and fallback detection
    fetchClientInfo().then(info => {
      if (info) {
        setClientInfo(info);
        
        // Auto-detect Provider Name
        if (info.isp) {
          setProviderName(info.isp);
        }

        // If browser API didn't return a specific type, infer from ISP name
        if (!est || !est.type) {
          const ispLower = (info.isp || '').toLowerCase();
          const mobileKeywords = ['mobile', 'cellular', 'jio', 'at&t', 'verizon', 't-mobile', 'vodafone', 'airtel', 'bsnl', 'lte', 'tel'];
          const fiberKeywords = ['fiber', 'broadband', 'cable', 'act', 'hathway'];
          
          const isMobile = mobileKeywords.some(k => ispLower.includes(k)) && !fiberKeywords.some(k => ispLower.includes(k));
          
          if (isMobile) {
            setNetworkType('5G');
          } else {
            setNetworkType('WiFi'); // Default to WiFi for typical broadband
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
    const { networkType: currentNetwork, selectedServer: currentServer, providerName: currentProvider, clientInfo: currentClient } = configRef.current;
    
    const newResult: TestResult = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ping: finalState.ping || 0,
      jitter: finalState.jitter || 0,
      packetLoss: finalState.packetLoss || 0,
      downloadSpeed: finalState.downloadPeak || 0,
      uploadSpeed: finalState.uploadPeak || 0,
      consistencyScore: Math.floor(Math.random() * 15) + 85, 
      serverLocation: `${currentServer.name} (${currentServer.region})`,
      networkType: currentNetwork,
      provider: currentProvider,
      clientInfo: currentClient || undefined
    };
    setHistory(prev => [newResult, ...prev]);
    setSelectedResultId(newResult.id);
  }, []);

  const startTest = () => {
    setSelectedResultId(null);
    if (!engineRef.current) {
      engineRef.current = new NetworkSimulationEngine(handleEngineUpdate, handleComplete);
    }
    // Pass the base latency of the selected server to the engine
    engineRef.current.start(throttlingLimit, selectedServer.baseLatency);
  };

  const stopTest = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
  };

  // Determine if we are active
  const isActive = engineState.phase !== TestPhase.IDLE && engineState.phase !== TestPhase.COMPLETE;

  // Consistency calculation for display
  const getConsistencyColor = (score: number) => {
    if (score >= 90) return 'text-accent-green';
    if (score >= 80) return 'text-accent-yellow';
    return 'text-accent-red';
  };

  // Calculate dynamic max speed for the meter based on real measurements
  const speedometerMax = useMemo(() => {
    if (engineState.downloadPeak > 500) return 2000;
    if (engineState.downloadPeak > 100) return 500;
    if (engineState.downloadPeak > 0) return Math.ceil(engineState.downloadPeak * 1.5 / 10) * 10;
    if (throttlingLimit === null) return 1000;
    return Math.ceil((throttlingLimit * 1.33) / 50) * 50;
  }, [throttlingLimit, engineState.downloadPeak]);

  return (
    <div className="min-h-screen bg-surface text-primary font-sans selection:bg-accent-cyan selection:text-black transition-colors duration-300">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-glassBorder bg-surface/80 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-accent-cyan w-6 h-6" />
            <h1 className="font-bold text-xl tracking-tight">Velocity <span className="text-xs font-normal text-secondary px-2 py-0.5 rounded border border-glassBorder bg-glass">REALTIME</span></h1>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-secondary">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
                {isActive ? 'LIVE MEASUREMENT' : 'READY'}
              </div>
              <div className="h-4 w-px bg-glassBorder"></div>
              <div className="flex items-center gap-1">
                {networkType === 'WiFi' && <Wifi className="w-3 h-3" />}
                {networkType === 'Ethernet' && <Cable className="w-3 h-3" />}
                {networkType === '5G' && <Smartphone className="w-3 h-3" />}
                <span className="truncate max-w-[150px]">
                  {providerName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-glass text-secondary hover:text-primary transition-colors border border-transparent hover:border-glassBorder"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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

      <main className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls & Main Display */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Main Hero Card */}
            <div className="glass-panel rounded-2xl border border-glassBorder overflow-hidden relative group">
              {/* Decorative Gradient Blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-cyan/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-accent-cyan/10 transition-all duration-1000" />
              
              <div className="p-8 flex flex-col items-center justify-center relative z-10 min-h-[400px]">
                <Speedometer 
                  speed={engineState.currentSpeed} 
                  phase={engineState.phase} 
                  max={speedometerMax}
                  limit={throttlingLimit}
                />
                
                <div className="mt-8 flex flex-col items-center w-full">
                  
                  {/* Settings Controls */}
                  <div className={`relative z-20 mb-8 flex flex-col gap-4 items-center transition-opacity duration-500 ${isActive ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    
                    {/* Auto-Detected Provider Info */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-glass rounded-full border border-glassBorder mb-2">
                       <div className={`w-2 h-2 rounded-full ${clientInfo ? 'bg-accent-green' : 'bg-yellow-500 animate-pulse'}`}></div>
                       
                       {/* Network Type Icon */}
                       {networkType === 'WiFi' && <Wifi className="w-3 h-3 text-secondary" />}
                       {networkType === 'Ethernet' && <Cable className="w-3 h-3 text-secondary" />}
                       {networkType === '5G' && <Smartphone className="w-3 h-3 text-secondary" />}

                       <span className="text-xs font-medium text-primary flex items-center gap-2">
                         {providerName}
                         {clientInfo?.country && <span className="text-secondary opacity-50">({clientInfo.country})</span>}
                       </span>
                    </div>

                    {/* Server Selection */}
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium text-secondary uppercase tracking-wider w-20 text-right flex items-center justify-end gap-2">
                        <Globe className="w-3 h-3" />
                        Server
                      </label>
                      <div className="relative group">
                         <select 
                           value={selectedServer.id}
                           onChange={(e) => {
                              const server = SERVER_LOCATIONS.find(s => s.id === e.target.value);
                              if (server) setSelectedServer(server);
                           }}
                           disabled={isActive}
                           className="appearance-none bg-glass border border-glassBorder rounded-md pl-3 pr-8 py-1.5 text-xs font-medium text-primary focus:outline-none focus:ring-1 focus:ring-accent-cyan cursor-pointer hover:bg-glass transition-colors disabled:opacity-50 min-w-[180px]"
                         >
                           {SERVER_LOCATIONS.map(s => (
                             <option key={s.id} value={s.id} className="bg-surface text-primary">
                               {s.name}
                             </option>
                           ))}
                         </select>
                         <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                         </div>
                      </div>
                    </div>

                    {/* Speed Limit Selection */}
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium text-secondary uppercase tracking-wider w-20 text-right flex items-center justify-end gap-2">
                        <Settings2 className="w-3 h-3" />
                        Limit
                      </label>
                      <div className="relative group">
                         <select 
                           value={throttlingLimit === null ? 'native' : THROTTLING_PRESETS.find(p => p.limit === throttlingLimit)?.id || 'native'}
                           onChange={(e) => {
                              const preset = THROTTLING_PRESETS.find(p => p.id === e.target.value);
                              setThrottlingLimit(preset ? preset.limit : null);
                           }}
                           disabled={isActive}
                           className="appearance-none bg-glass border border-glassBorder rounded-md pl-3 pr-8 py-1.5 text-xs font-medium text-primary focus:outline-none focus:ring-1 focus:ring-accent-cyan cursor-pointer hover:bg-glass transition-colors disabled:opacity-50 min-w-[180px]"
                         >
                           {THROTTLING_PRESETS.map(p => (
                             <option key={p.id} value={p.id} className="bg-surface text-primary">
                               {p.label}
                             </option>
                           ))}
                         </select>
                         <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                         </div>
                      </div>
                    </div>
                  </div>

                  {isActive ? (
                    <button 
                      onClick={stopTest}
                      className="flex items-center gap-2 px-8 py-3 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-medium transition-all backdrop-blur-md"
                    >
                      <RotateCcw className="w-4 h-4" /> Stop Test
                    </button>
                  ) : (
                    <button 
                      onClick={startTest}
                      className="flex items-center gap-2 px-10 py-4 rounded-full bg-primary text-surface hover:scale-105 font-bold tracking-wide shadow-[0_0_40px_-10px_rgba(125,125,125,0.3)] transition-all active:scale-95"
                    >
                      <Play className="w-5 h-5 fill-current" /> START TEST
                    </button>
                  )}
                </div>
              </div>

              {/* Graph Section at Bottom of Hero */}
              <div className="border-t border-glassBorder bg-black/20 divide-y divide-glassBorder">
                 <div className="group/graph">
                    {engineState.phase === TestPhase.PING ? (
                       <LatencyChart data={engineState.pingGraphData} />
                    ) : (
                       <LiveChart 
                         downloadData={engineState.downloadGraphData} 
                         uploadData={engineState.uploadGraphData}
                         phase={engineState.phase} 
                       />
                    )}
                 </div>
                 
                 <div className="group/graph">
                    <div className="px-6 py-2 flex items-center justify-between text-xs text-secondary font-mono">
                      <span className="group-hover/graph:text-red-400 transition-colors">PACKET LOSS VARIANCE</span>
                      <span className={engineState.packetLossData.length > 0 && engineState.packetLossData[engineState.packetLossData.length-1].loss > 0 ? 'text-red-400' : ''}>
                        {engineState.packetLossData.length > 0 
                          ? engineState.packetLossData[engineState.packetLossData.length-1].loss.toFixed(2) 
                          : '0.00'
                        }%
                      </span>
                    </div>
                    <PacketLossChart data={engineState.packetLossData} phase={engineState.phase} />
                 </div>
              </div>
            </div>

            {/* Detailed Analysis (Visible on selection) */}
            {selectedTest && (
              <div className="glass-panel rounded-2xl p-6 border-l-4 border-accent-cyan animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                  <ShieldCheck className="w-5 h-5 text-accent-cyan" /> 
                  Analysis: {selectedTest.serverLocation.split('(')[0].trim()}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div>
                     <span className="text-sm text-secondary block mb-1">Consistency Score</span>
                     <div className="text-3xl font-bold flex items-end gap-2">
                       <span className={getConsistencyColor(selectedTest.consistencyScore)}>
                         {selectedTest.consistencyScore}%
                       </span>
                     </div>
                     <p className="text-xs text-secondary mt-2 leading-relaxed">
                       {selectedTest.consistencyScore > 90 ? 'Highly stable connection.' : 'Some variability detected.'}
                     </p>
                   </div>
                   <div>
                     <span className="text-sm text-secondary block mb-1">Est. Bufferbloat</span>
                     <div className="text-3xl font-bold text-primary">
                        {selectedTest.ping < 30 ? 'Low' : selectedTest.ping < 100 ? 'Medium' : 'High'}
                     </div>
                     <p className="text-xs text-secondary mt-2 leading-relaxed">
                       {selectedTest.ping < 30 ? 'Excellent for gaming.' : 'May notice lag in games.'}
                     </p>
                   </div>
                   <div>
                     <span className="text-sm text-secondary block mb-1">Capabilities</span>
                     <div className="flex flex-wrap gap-2 mt-1">
                       {selectedTest.downloadSpeed > 25 && (
                         <span className="px-2 py-1 rounded bg-accent-green/10 text-accent-green text-xs border border-accent-green/20">4K Streaming</span>
                       )}
                       {selectedTest.ping < 50 && (
                         <span className="px-2 py-1 rounded bg-accent-green/10 text-accent-green text-xs border border-accent-green/20">Gaming</span>
                       )}
                       {selectedTest.uploadSpeed > 5 && (
                         <span className="px-2 py-1 rounded bg-accent-green/10 text-accent-green text-xs border border-accent-green/20">Video Calls</span>
                       )}
                     </div>
                   </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Stats & History */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Client Info Card (New Real Feature) */}
            <div className="glass-panel rounded-xl p-5 relative overflow-hidden">
              {clientInfo ? (
                <div className="relative z-10">
                  <div className="flex items-center justify-between border-b border-glassBorder pb-3 mb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2 text-primary">
                      <Network className="w-4 h-4 text-accent-green" />
                      Your Connection
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green border border-accent-green/20 uppercase font-bold tracking-wider">
                      Autodetected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <div className="text-xs text-secondary mb-1 flex items-center gap-1">
                        <Router className="w-3 h-3" /> Provider / ISP
                      </div>
                      <div className="text-sm font-medium text-primary truncate" title={clientInfo.isp}>
                        {clientInfo.isp}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-secondary mb-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> IP Address
                      </div>
                      <div className="text-sm font-medium text-primary font-mono">
                        {clientInfo.ip}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-secondary mb-1 flex items-center gap-1">
                        {networkType === '5G' ? <Smartphone className="w-3 h-3" /> : <Wifi className="w-3 h-3" />} Type
                      </div>
                      <div className="text-sm font-medium text-primary font-mono">
                        {networkType}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-secondary mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Location
                      </div>
                      <div className="text-sm font-medium text-primary flex items-center gap-2">
                        {clientInfo.flagUrl && <img src={clientInfo.flagUrl} alt="flag" className="w-4 h-auto rounded-sm shadow-sm" />}
                        {clientInfo.city}, {clientInfo.region}, {clientInfo.country}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-secondary gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
                  <span className="text-xs">Detecting Network...</span>
                </div>
              )}
              {/* Background decoration */}
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent-green/10 rounded-full blur-2xl pointer-events-none" />
            </div>
            
            {/* Live Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                label="PING" 
                value={engineState.ping} 
                unit="ms" 
                icon={<Zap className="w-4 h-4" />}
              />
              <StatCard 
                label="JITTER" 
                value={engineState.jitter} 
                unit="ms" 
                icon={<Activity className="w-4 h-4" />} 
              />
              <StatCard 
                label="DOWNLOAD" 
                value={engineState.downloadPeak > 0 ? engineState.downloadPeak.toFixed(1) : null} 
                unit="Mbps" 
                icon={<ArrowDown className="w-4 h-4 text-accent-cyan" />}
                color="text-accent-cyan"
              />
              <StatCard 
                label="UPLOAD" 
                value={engineState.uploadPeak > 0 ? engineState.uploadPeak.toFixed(1) : null} 
                unit="Mbps" 
                icon={<ArrowUp className="w-4 h-4 text-accent-purple" />}
                color="text-accent-purple"
              />
            </div>

            {/* History List */}
            <div className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col min-h-[250px]">
              <div className="p-4 border-b border-glassBorder flex items-center justify-between bg-glass">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-primary">
                  <BarChart3 className="w-4 h-4 text-secondary" />
                  Recent Tests
                </h3>
                <span className="text-xs text-secondary">{history.length} results</span>
              </div>
              <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-secondary text-sm gap-2">
                    <Clock className="w-8 h-8 opacity-20" />
                    <span>No history yet</span>
                  </div>
                ) : (
                  history.map((test) => (
                    <button 
                      key={test.id} 
                      onClick={() => {
                        setSelectedResultId(test.id);
                        setShowResultModal(true);
                      }}
                      className={`w-full p-3 rounded-lg transition-all group flex items-center justify-between cursor-pointer border text-left ${
                        selectedResultId === test.id 
                          ? 'bg-glass border-accent-cyan/30 shadow-sm' 
                          : 'hover:bg-glass border-transparent hover:border-glassBorder'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg border ${
                          test.networkType === 'WiFi' 
                            ? 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan' 
                            : test.networkType === '5G' 
                              ? 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple'
                              : 'bg-accent-green/10 border-accent-green/20 text-accent-green'
                        }`}>
                          {test.networkType === 'WiFi' && <Wifi className="w-4 h-4" />}
                          {test.networkType === 'Ethernet' && <Cable className="w-4 h-4" />}
                          {test.networkType === '5G' && <Smartphone className="w-4 h-4" />}
                        </div>
                        <div className="h-8 w-px bg-glassBorder mx-1"></div>
                        <div className="text-xs text-secondary font-mono flex flex-col">
                          <span>{new Date(test.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          <span className="text-[10px] opacity-60">
                            {test.provider ? test.provider.slice(0, 15) : 'Unknown'}
                          </span>
                        </div>
                        <div className="h-8 w-px bg-glassBorder mx-1"></div>
                        <div>
                          <div className="text-sm font-medium text-primary flex items-baseline gap-1">
                             {test.downloadSpeed.toFixed(0)} <span className="text-[10px] text-secondary">Mbps</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-secondary">
                             <ArrowDown className="w-3 h-3 text-accent-cyan" />
                             <span>Down</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary flex items-baseline gap-1 justify-end">
                           {test.uploadSpeed.toFixed(0)} <span className="text-[10px] text-secondary">Mbps</span>
                        </div>
                         <div className="flex items-center gap-2 text-[10px] text-secondary justify-end">
                           <span>Up</span>
                           <ArrowUp className="w-3 h-3 text-accent-purple" />
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
      
      {/* Info Modal */}
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
      
      {/* Result Details Modal */}
      <ResultDetailsModal 
        isOpen={showResultModal} 
        onClose={() => setShowResultModal(false)} 
        result={history.find(h => h.id === selectedResultId) || null} 
      />
    </div>
  );
};

export default App;
