'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { LocationPoint } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issues
const getLeafletIcon = (iconUrl: string) => {
  return new Icon({
    iconUrl: iconUrl || 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

interface MapUpdatePositionProps {
  position: [number, number];
}

// Component to update map center when position changes
function MapUpdatePosition({ position }: MapUpdatePositionProps) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [map, position]);
  
  return null;
}

export interface MapPoint {
  position: [number, number];
  title: string;
  description?: string;
  icon?: string;
}

interface MapProps {
  center: [number, number];
  zoom?: number;
  points: MapPoint[];
  className?: string;
  height?: string;
  width?: string;
  followActivePoint?: boolean;
  activePointIndex?: number;
}

export default function Map({ 
  center, 
  zoom = 13, 
  points, 
  className = '',
  height = '100%',
  width = '100%',
  followActivePoint = false,
  activePointIndex = 0
}: MapProps) {
  // Check if we're on the client side to avoid SSR issues with Leaflet
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return (
      <div 
        className={`bg-muted animate-pulse rounded-md ${className}`}
        style={{ height, width }}
      >
        <div className="flex items-center justify-center h-full">
          Loading map...
        </div>
      </div>
    );
  }
  
  const activePosition = followActivePoint && points[activePointIndex] 
    ? points[activePointIndex].position 
    : center;
    
  return (
    <div className={className} style={{ height, width }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {followActivePoint && (
          <MapUpdatePosition position={activePosition} />
        )}
        
        {points.map((point, index) => (
          <Marker 
            key={`${point.position[0]}-${point.position[1]}-${index}`}
            position={point.position}
            icon={getLeafletIcon(point.icon || '')}
          >
            <Popup>
              <div>
                <h3 className="font-semibold">{point.title}</h3>
                {point.description && <p>{point.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}