
import React, { useEffect, useRef } from 'react';
import { X, Map, Signal, Wifi, Info } from 'lucide-react';
import * as L from 'leaflet';
import { INDIAN_CITIES_COVERAGE } from '../constants';

interface CoverageMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CoverageMapModal: React.FC<CoverageMapModalProps> = ({ isOpen, onClose }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current || mapRef.current) return;

    // Initialize Map
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      center: [22.3511148, 78.6677428], // Center of India
      zoom: 4.5,
      minZoom: 4,
    });

    mapRef.current = map;

    // Add Dark Theme Tile Layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Add Markers
    INDIAN_CITIES_COVERAGE.forEach(city => {
      const getColor = () => {
        if (city.status === 'Excellent') return '#00D4FF'; // Cyan
        if (city.status === 'Good') return '#10B981'; // Green
        return '#F59E0B'; // Yellow/Amber
      };

      const color = getColor();
      const radius = city.status === 'Excellent' ? 6 : 4;

      // Custom Div Icon for pulsing effect
      const icon = L.divIcon({
        className: 'bg-transparent border-none', // Remove default white box
        html: `
          <div class="relative flex items-center justify-center w-full h-full">
            <div class="absolute rounded-full animate-ping opacity-75" style="background-color: ${color}; width: ${radius * 3}px; height: ${radius * 3}px;"></div>
            <div class="relative rounded-full shadow-[0_0_10px_${color}]" style="background-color: ${color}; width: ${radius * 2}px; height: ${radius * 2}px;"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([city.lat, city.lng], { icon }).addTo(map);

      // Popup Content
      const popupContent = `
        <div class="p-2 min-w-[180px] font-sans">
          <div class="flex items-center justify-between mb-2 border-b border-white/10 pb-1">
            <span class="font-bold text-white text-sm">${city.name}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 border border-white/5">${city.tech}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="text-gray-400">Status</div>
            <div class="text-right font-medium" style="color: ${color}">${city.status}</div>
            
            <div class="text-gray-400">Avg Speed</div>
            <div class="text-right font-mono text-white">${city.avgSpeed} Mbps</div>
            
            <div class="text-gray-400">Providers</div>
            <div class="text-right text-white">${city.provider}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'glass-popup'
      });

      marker.on('mouseover', function(this: L.Marker) {
        this.openPopup();
      });
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle Resize invalidate
  useEffect(() => {
    if (isOpen && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-2 sm:px-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-5xl h-[85vh] glass-panel rounded-2xl border border-glassBorder animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-glassBorder bg-panel/50 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
              <Map className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                Network Coverage Map
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-purple/20 text-accent-purple border border-accent-purple/30">INDIA 5G</span>
              </h2>
              <p className="text-xs text-secondary">Live connectivity status across major metropolitan areas</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-glass text-secondary hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-[#0B0F14]">
           <div ref={containerRef} className="absolute inset-0 z-0" style={{ backgroundColor: '#0B0F14' }} />
           
           {/* Legend Overlay */}
           <div className="absolute bottom-6 right-6 z-[400] p-4 rounded-xl glass-panel border border-glassBorder shadow-2xl max-w-[200px]">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                <Signal className="w-3 h-3" /> Signal Strength
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_8px_#00D4FF]"></div>
                  <span className="text-xs text-primary font-medium">Excellent (5G+)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_5px_#10B981]"></div>
                  <span className="text-xs text-primary font-medium">Good (5G)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-yellow"></div>
                  <span className="text-xs text-primary font-medium">Fair (4G LTE)</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-secondary leading-tight flex items-start gap-1.5">
                <Info className="w-3 h-3 shrink-0 mt-0.5" />
                Data represents aggregated peak speeds from recent user tests.
              </div>
           </div>

           {/* Top Left Stats */}
           <div className="absolute top-6 left-6 z-[400] flex flex-col gap-2">
              <div className="px-3 py-2 rounded-lg glass-panel border border-glassBorder flex items-center gap-3">
                 <Wifi className="w-4 h-4 text-accent-cyan" />
                 <div>
                   <div className="text-[10px] text-secondary uppercase font-bold">Total Cities</div>
                   <div className="text-sm font-bold text-primary">{INDIAN_CITIES_COVERAGE.length} Active Zones</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CoverageMapModal;
