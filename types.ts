
export enum TestPhase {
  IDLE = 'IDLE',
  PING = 'PING',
  DOWNLOAD = 'DOWNLOAD',
  UPLOAD = 'UPLOAD',
  COMPLETE = 'COMPLETE'
}

export interface SpeedPoint {
  time: number;
  speed: number; // Mbps
}

export interface PacketLossPoint {
  time: number;
  loss: number; // Percentage %
}

export interface PingPoint {
  time: number;
  ping: number; // ms
}

export interface ClientInfo {
  ip: string;
  isp: string;
  city: string;
  country: string;
  region: string;
  flagUrl?: string;
  asn?: string;
  org?: string;
  timezone?: string;
}

export interface TestResult {
  id: string;
  timestamp: number;
  ping: number; // ms
  jitter: number; // ms
  packetLoss: number; // %
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  stabilityScore: number; // 0-100
  consistencyScore: number; // 0-100 (Legacy, can be same as stability)
  serverLocation: string;
  networkType: 'WiFi' | 'Ethernet' | '5G';
  provider?: string;
  clientInfo?: ClientInfo; // Real client data
  aiAnalysis?: string; // Markdown string from Gemini
  isWifi6E?: boolean;
  isDataSaver?: boolean;
}

export interface EngineState {
  phase: TestPhase;
  currentSpeed: number; // Mbps, smoothed
  progress: number; // 0-100
  ping: number | null;
  jitter: number | null;
  packetLoss: number | null;
  stabilityScore: number; // 0-100, Real-time
  downloadPeak: number;
  uploadPeak: number;
  graphData: SpeedPoint[]; // Rolling window for immediate display
  downloadGraphData: SpeedPoint[]; // Full history
  uploadGraphData: SpeedPoint[];   // Full history
  pingGraphData: PingPoint[];
  packetLossData: PacketLossPoint[];
}

export interface ThrottlingPreset {
  id: string;
  label: string;
  limit: number | null;
}

export interface ServerLocation {
  id: string;
  name: string;
  region: string;
  baseLatency: number; // ms
  distance: string;
}

export interface Carrier {
  id: string;
  name: string;
}

// Extend navigator for Network Information API
export interface NetworkInformation extends EventTarget {
  readonly downlink?: number;
  readonly effectiveType?: string;
  readonly rtt?: number;
  readonly saveData?: boolean;
  readonly type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
  onchange?: EventListener;
}

export interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}
