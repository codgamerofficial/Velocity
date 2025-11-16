
import { TestPhase, ThrottlingPreset, ServerLocation, Carrier } from "./types";

export const APP_NAME = "Velocity";

export const PHASE_LABELS: Record<TestPhase, string> = {
  [TestPhase.IDLE]: "Ready to Start",
  [TestPhase.PING]: "Testing Latency...",
  [TestPhase.DOWNLOAD]: "Testing Download...",
  [TestPhase.UPLOAD]: "Testing Upload...",
  [TestPhase.COMPLETE]: "Test Complete"
};

export const MAX_SPEED_METER = 1000; // Mbps cap for meter visual
export const GRAPH_POINTS_COUNT = 60; // Number of points in the rolling graph

// Colors matching Tailwind config
export const COLORS = {
  cyan: '#00D4FF',
  purple: '#9D6CFF',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444'
};

export const THROTTLING_PRESETS: ThrottlingPreset[] = [
  { id: 'native', label: 'Uncapped (Native)', limit: null },
  { id: 'fiber_1g', label: 'Fiber Gigabit (1 Gbps)', limit: 1000 },
  { id: 'fiber_500', label: 'Fiber 500 (500 Mbps)', limit: 500 },
  { id: 'cable_300', label: 'Cable High (300 Mbps)', limit: 300 },
  { id: 'cable_100', label: 'Cable Std (100 Mbps)', limit: 100 },
  { id: 'dsl_25', label: 'DSL/VDSL (25 Mbps)', limit: 25 },
  { id: '4g_lte', label: '4G LTE (15 Mbps)', limit: 15 },
  { id: '3g', label: '3G HSPA+ (5 Mbps)', limit: 5 },
];

export const SERVER_LOCATIONS: ServerLocation[] = [
  { id: 'in-mum', name: 'Mumbai, IN', region: 'India West', baseLatency: 24, distance: 'Local' },
  { id: 'in-blr', name: 'Bangalore, IN', region: 'India South', baseLatency: 28, distance: '~500 miles' },
  { id: 'in-del', name: 'New Delhi, IN', region: 'India North', baseLatency: 35, distance: '~700 miles' },
  { id: 'us-east', name: 'Ashburn, VA', region: 'US East', baseLatency: 18, distance: '~45 miles' },
  { id: 'us-central', name: 'Chicago, IL', region: 'US Central', baseLatency: 42, distance: '~600 miles' },
  { id: 'us-west', name: 'San Jose, CA', region: 'US West', baseLatency: 75, distance: '~2400 miles' },
  { id: 'sa-east', name: 'São Paulo, BR', region: 'South America', baseLatency: 120, distance: '~4800 miles' },
  { id: 'sa-west', name: 'Santiago, CL', region: 'South America', baseLatency: 135, distance: '~5100 miles' },
  { id: 'eu-west', name: 'London, UK', region: 'EU West', baseLatency: 105, distance: '~3600 miles' },
  { id: 'af-north', name: 'Cairo, EG', region: 'Africa North', baseLatency: 115, distance: '~5800 miles' },
  { id: 'af-south', name: 'Cape Town, ZA', region: 'Africa South', baseLatency: 190, distance: '~8100 miles' },
  { id: 'ap-northeast', name: 'Tokyo, JP', region: 'Asia Pacific', baseLatency: 150, distance: '~6000 miles' },
];

export const INDIAN_CARRIERS: Carrier[] = [
  { id: 'jio', name: 'Jio True 5G' },
  { id: 'airtel', name: 'Airtel 5G Plus' },
  { id: 'vi', name: 'Vi India' },
  { id: 'bsnl', name: 'BSNL 4G' },
];

export const INDIAN_ISPS: Carrier[] = [
  { id: 'jio_fiber', name: 'JioFiber' },
  { id: 'airtel_fiber', name: 'Airtel Xstream' },
  { id: 'act', name: 'ACT Fibernet' },
  { id: 'hathway', name: 'Hathway' },
  { id: 'tataplay', name: 'Tata Play Fiber' },
  { id: 'excitel', name: 'Excitel' },
  { id: 'you', name: 'YOU Broadband' },
  { id: 'bsnl_fiber', name: 'BSNL Bharat Fibre' },
  { id: 'gtpl', name: 'GTPL' },
];
