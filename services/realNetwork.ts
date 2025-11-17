
import { ClientInfo } from "../types";

/**
 * Fetches public IP and ISP information using a free geolocation API.
 * Using ipwho.is as it is CORS-friendly.
 */
export const fetchClientInfo = async (): Promise<ClientInfo | null> => {
  try {
    const response = await fetch('https://ipwho.is/');
    const data = await response.json();
    
    if (!data.success) {
      console.warn('IP Lookup failed:', data.message);
      return null;
    }

    return {
      ip: data.ip,
      // Prefer connection.isp or org as they often contain the authentic carrier name
      isp: data.connection?.isp || data.isp || data.org || 'Unknown Provider',
      city: data.city,
      region: data.region,
      country: data.country,
      flagUrl: data.flag?.img,
      asn: data.connection?.asn?.toString(), // Added ASN
      org: data.connection?.org, // Added Org
      timezone: data.timezone?.id // Added Timezone
    };
  } catch (error) {
    console.error('Failed to fetch client info:', error);
    return null;
  }
};

/**
 * Performs a real HTTP ping to a high-availability CDN.
 */
export const measureRealLatency = async (): Promise<number> => {
  const start = performance.now();
  try {
    // 1.1.1.1/cdn-cgi/trace is a lightweight text endpoint
    await fetch(`https://1.1.1.1/cdn-cgi/trace?t=${Date.now()}`, { 
      mode: 'no-cors',
      cache: 'no-store',
      method: 'HEAD' 
    });
    const end = performance.now();
    return Math.floor(end - start);
  } catch (e) {
    // Fallback if the fetch fails (e.g. offline)
    return -1;
  }
};

/**
 * Gets the browser's estimated network capabilities if available.
 */
export const getBrowserNetworkEstimates = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any;
  if (nav.connection) {
    return {
      downlink: nav.connection.downlink, // Estimated Mbps
      rtt: nav.connection.rtt, // Estimated RTT
      effectiveType: nav.connection.effectiveType, // '4g', '3g', etc.
      type: nav.connection.type, // 'cellular', 'wifi', 'ethernet' (Experimental)
      saveData: nav.connection.saveData // Check native data saver preference
    };
  }
  return null;
};

/**
 * Performs a real download test by fetching large image assets from a global CDN.
 * Uses multiple parallel streams to saturate the bandwidth and measures instant throughput.
 */
export const runRealDownloadTest = async (
  durationMs: number,
  onProgress: (speedMbps: number, progress: number) => void,
  signal: AbortSignal
): Promise<number> => {
  const startTime = performance.now();
  let totalBytes = 0;
  
  // High-bandwidth assets
  const assets = [
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=4000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=4000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=4000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=4000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?q=80&w=4000&auto=format&fit=crop'
  ];

  let lastReportTime = startTime;
  let lastBytes = 0;

  // Speed reporting interval (Calculates Instant Speed)
  const reportInterval = setInterval(() => {
    const now = performance.now();
    const elapsed = now - startTime;
    const dt = (now - lastReportTime) / 1000; // Delta time in seconds
    
    if (dt > 0.1) { // Update approx every 100ms
      const dBytes = totalBytes - lastBytes;
      const instantSpeedMbps = (dBytes * 8) / dt / 1000000;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      
      onProgress(instantSpeedMbps, progress);
      
      lastReportTime = now;
      lastBytes = totalBytes;
    }
  }, 100);

  const fetchLoop = async (url: string) => {
    while (performance.now() - startTime < durationMs && !signal.aborted) {
      try {
        const uniqueUrl = `${url}&nocache=${Date.now()}-${Math.random()}`;
        const response = await fetch(uniqueUrl, { 
          signal,
          mode: 'cors',
          cache: 'no-store'
        });
        
        if (!response.body) break;
        const reader = response.body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (signal.aborted) return;
          // Strict timeout check inside the loop
          if (performance.now() - startTime >= durationMs) return;
          
          totalBytes += value.length;
        }
      } catch (e) {
        if (signal.aborted) return;
        // Short backoff on error
        await new Promise(r => setTimeout(r, 50));
      }
    }
  };

  try {
    // Run parallel connections
    const tasks = assets.map(url => fetchLoop(url));
    await Promise.all(tasks);
  } catch (e) {
    // Ignore abort errors
  } finally {
    clearInterval(reportInterval);
  }

  const finalDuration = (performance.now() - startTime) / 1000;
  // Return average speed for the final result record
  return (totalBytes * 8) / finalDuration / 1000000;
};
