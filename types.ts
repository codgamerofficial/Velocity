
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

export interface ClientInfo {
  ip: string;
  isp: string;
  city: string;
  country: string;
  region: string;
  flagUrl?: string;
}

export interface TestResult {
  id: string;
  timestamp: number;
  ping: number; // ms
  jitter: number; // ms
  packetLoss: number; // %
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  consistencyScore: number; // 0-100
  serverLocation: string;
  networkType: 'WiFi' | 'Ethernet' | '5G';
  provider?: string;
  clientInfo?: ClientInfo; // Real client data
}

export interface EngineState {
  phase: TestPhase;
  currentSpeed: number; // Mbps, smoothed
  progress: number; // 0-100
  ping: number | null;
  jitter: number | null;
  packetLoss: number | null;
  downloadPeak: number;
  uploadPeak: number;
  graphData: SpeedPoint[]; // Rolling window for immediate display
  downloadGraphData: SpeedPoint[]; // Full history
  uploadGraphData: SpeedPoint[];   // Full history
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
  onchange?: EventListener;
}

export interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}
