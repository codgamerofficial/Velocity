
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

export interface CityCoverage {
  name: string;
  lat: number;
  lng: number;
  status: 'Excellent' | 'Good' | 'Fair';
  tech: '5G Plus' | '5G' | '4G LTE';
  avgSpeed: number;
  provider: string;
}

export const INDIAN_CITIES_COVERAGE: CityCoverage[] = [
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, status: 'Excellent', tech: '5G Plus', avgSpeed: 850, provider: 'Multiple' },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, status: 'Excellent', tech: '5G Plus', avgSpeed: 780, provider: 'Multiple' },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946, status: 'Excellent', tech: '5G', avgSpeed: 620, provider: 'Multiple' },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, status: 'Excellent', tech: '5G', avgSpeed: 590, provider: 'Multiple' },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, status: 'Good', tech: '5G', avgSpeed: 410, provider: 'Multiple' },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, status: 'Excellent', tech: '5G Plus', avgSpeed: 680, provider: 'Multiple' },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, status: 'Good', tech: '5G', avgSpeed: 380, provider: 'Multiple' },
  { name: 'Surat', lat: 21.1702, lng: 72.8311, status: 'Good', tech: '5G', avgSpeed: 350, provider: 'Jio/Airtel' },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, status: 'Excellent', tech: '5G Plus', avgSpeed: 510, provider: 'Multiple' },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, status: 'Good', tech: '5G', avgSpeed: 290, provider: 'Jio/Airtel' },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462, status: 'Good', tech: '5G', avgSpeed: 310, provider: 'Jio/Airtel' },
  { name: 'Kanpur', lat: 26.4499, lng: 80.3319, status: 'Fair', tech: '4G LTE', avgSpeed: 65, provider: 'Airtel' },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882, status: 'Good', tech: '5G', avgSpeed: 240, provider: 'Jio' },
  { name: 'Indore', lat: 22.7196, lng: 75.8577, status: 'Good', tech: '5G', avgSpeed: 280, provider: 'Multiple' },
  { name: 'Thane', lat: 19.2183, lng: 72.9781, status: 'Excellent', tech: '5G Plus', avgSpeed: 720, provider: 'Multiple' },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126, status: 'Good', tech: '5G', avgSpeed: 220, provider: 'Jio' },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, status: 'Good', tech: '5G', avgSpeed: 260, provider: 'Airtel' },
  { name: 'Patna', lat: 25.5941, lng: 85.1376, status: 'Fair', tech: '4G LTE', avgSpeed: 45, provider: 'Multiple' },
  { name: 'Vadodara', lat: 22.3072, lng: 73.1812, status: 'Good', tech: '5G', avgSpeed: 310, provider: 'Jio' },
  { name: 'Ghaziabad', lat: 28.6692, lng: 77.4538, status: 'Excellent', tech: '5G', avgSpeed: 450, provider: 'Multiple' },
  { name: 'Ludhiana', lat: 30.9010, lng: 75.8573, status: 'Good', tech: '5G', avgSpeed: 280, provider: 'Airtel' },
  { name: 'Agra', lat: 27.1767, lng: 78.0081, status: 'Fair', tech: '4G LTE', avgSpeed: 55, provider: 'Multiple' },
  { name: 'Nashik', lat: 19.9975, lng: 73.7898, status: 'Good', tech: '5G', avgSpeed: 230, provider: 'Jio' },
  { name: 'Ranchi', lat: 23.3441, lng: 85.3096, status: 'Fair', tech: '4G LTE', avgSpeed: 50, provider: 'Multiple' },
  { name: 'Meerut', lat: 28.9845, lng: 77.7064, status: 'Good', tech: '5G', avgSpeed: 260, provider: 'Jio' },
  { name: 'Rajkot', lat: 22.3039, lng: 70.8022, status: 'Good', tech: '5G', avgSpeed: 275, provider: 'Jio' },
  { name: 'Varanasi', lat: 25.3176, lng: 82.9739, status: 'Good', tech: '5G', avgSpeed: 320, provider: 'Jio/Airtel' },
  { name: 'Srinagar', lat: 34.0837, lng: 74.7973, status: 'Fair', tech: '4G LTE', avgSpeed: 40, provider: 'Multiple' },
  { name: 'Aurangabad', lat: 19.8762, lng: 75.3433, status: 'Good', tech: '5G', avgSpeed: 190, provider: 'Jio' },
  { name: 'Dhanbad', lat: 23.7957, lng: 86.4304, status: 'Fair', tech: '4G LTE', avgSpeed: 35, provider: 'Multiple' },
  { name: 'Amritsar', lat: 31.6340, lng: 74.8723, status: 'Good', tech: '5G', avgSpeed: 240, provider: 'Airtel' },
  { name: 'Navi Mumbai', lat: 19.0330, lng: 73.0297, status: 'Excellent', tech: '5G Plus', avgSpeed: 810, provider: 'Multiple' },
  { name: 'Allahabad', lat: 25.4358, lng: 81.8463, status: 'Fair', tech: '4G LTE', avgSpeed: 60, provider: 'Multiple' },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, status: 'Good', tech: '5G', avgSpeed: 310, provider: 'Airtel' },
  { name: 'Jabalpur', lat: 23.1815, lng: 79.9469, status: 'Fair', tech: '4G LTE', avgSpeed: 55, provider: 'Multiple' },
  { name: 'Gwalior', lat: 26.2183, lng: 78.1828, status: 'Good', tech: '5G', avgSpeed: 210, provider: 'Jio' },
  { name: 'Vijayawada', lat: 16.5062, lng: 80.6480, status: 'Good', tech: '5G', avgSpeed: 280, provider: 'Multiple' },
  { name: 'Jodhpur', lat: 26.2389, lng: 73.0243, status: 'Good', tech: '5G', avgSpeed: 230, provider: 'Jio' },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198, status: 'Good', tech: '5G', avgSpeed: 250, provider: 'Airtel' },
  { name: 'Raipur', lat: 21.2514, lng: 81.6296, status: 'Fair', tech: '4G LTE', avgSpeed: 65, provider: 'Multiple' },
  { name: 'Kota', lat: 25.2138, lng: 75.8648, status: 'Good', tech: '5G', avgSpeed: 220, provider: 'Jio' },
  { name: 'Guwahati', lat: 26.1445, lng: 91.7362, status: 'Good', tech: '5G', avgSpeed: 200, provider: 'Jio/Airtel' },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, status: 'Excellent', tech: '5G', avgSpeed: 480, provider: 'Multiple' },
  { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245, status: 'Good', tech: '5G', avgSpeed: 340, provider: 'Jio' },
  { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, status: 'Good', tech: '5G', avgSpeed: 290, provider: 'Multiple' },
];
