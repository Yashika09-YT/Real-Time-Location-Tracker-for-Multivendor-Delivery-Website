'use client';

import { LocationPoint } from './types';

// Function to generate a random point within a given radius of a center point
const getRandomPointNearby = (
  center: LocationPoint,
  radiusInMeters: number = 500
): LocationPoint => {
  // Earth's radius in meters
  const earthRadius = 6378137;
  
  // Convert radius from meters to degrees
  const radiusInDegrees = radiusInMeters / earthRadius * (180 / Math.PI);
  
  // Generate random angle
  const randomAngle = Math.random() * 2 * Math.PI;
  
  // Generate random distance within the radius
  const randomDistance = Math.random() * radiusInDegrees;
  
  // Calculate offset
  const latOffset = randomDistance * Math.sin(randomAngle);
  const lngOffset = randomDistance * Math.cos(randomAngle) / Math.cos(center.latitude * Math.PI / 180);
  
  return {
    latitude: center.latitude + latOffset,
    longitude: center.longitude + lngOffset,
    timestamp: new Date().toISOString(),
  };
};

// Function to calculate a point along a path between start and destination
const getPointAlongPath = (
  start: LocationPoint,
  destination: LocationPoint,
  progress: number // 0.0 to 1.0
): LocationPoint => {
  return {
    latitude: start.latitude + (destination.latitude - start.latitude) * progress,
    longitude: start.longitude + (destination.longitude - start.longitude) * progress,
    timestamp: new Date().toISOString(),
  };
};

// Function to add a small random variation to a location (to simulate GPS jitter)
const addJitter = (
  point: LocationPoint,
  jitterAmount: number = 0.0001
): LocationPoint => {
  return {
    latitude: point.latitude + (Math.random() - 0.5) * jitterAmount,
    longitude: point.longitude + (Math.random() - 0.5) * jitterAmount,
    timestamp: new Date().toISOString(),
  };
};

// Location simulator class
export class LocationSimulator {
  private startPoint: LocationPoint;
  private endPoint: LocationPoint;
  private currentPoint: LocationPoint;
  private progress: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private updateCallbacks: ((location: LocationPoint) => void)[] = [];
  private speedFactor: number = 1;
  private jitterEnabled: boolean = true;
  
  constructor(start: LocationPoint, end: LocationPoint) {
    this.startPoint = { ...start };
    this.endPoint = { ...end };
    this.currentPoint = { ...start };
  }
  
  public start(intervalMs: number = 2000): void {
    if (this.intervalId !== null) {
      this.stop();
    }
    
    this.intervalId = setInterval(() => {
      this.progress += 0.02 * this.speedFactor;
      
      if (this.progress >= 1.0) {
        this.progress = 1.0;
        this.currentPoint = { ...this.endPoint, timestamp: new Date().toISOString() };
        this.notifyUpdateCallbacks();
        this.stop();
        return;
      }
      
      let newPoint = getPointAlongPath(
        this.startPoint,
        this.endPoint,
        this.progress
      );
      
      if (this.jitterEnabled) {
        newPoint = addJitter(newPoint);
      }
      
      this.currentPoint = newPoint;
      this.notifyUpdateCallbacks();
    }, intervalMs);
  }
  
  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  public reset(): void {
    this.stop();
    this.progress = 0;
    this.currentPoint = { ...this.startPoint, timestamp: new Date().toISOString() };
    this.notifyUpdateCallbacks();
  }
  
  public getCurrentLocation(): LocationPoint {
    return { ...this.currentPoint };
  }
  
  public setSpeedFactor(factor: number): void {
    this.speedFactor = Math.max(0.1, factor);
  }
  
  public setJitterEnabled(enabled: boolean): void {
    this.jitterEnabled = enabled;
  }
  
  public onUpdate(callback: (location: LocationPoint) => void): void {
    this.updateCallbacks.push(callback);
  }
  
  public offUpdate(callback: (location: LocationPoint) => void): void {
    this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
  }
  
  private notifyUpdateCallbacks(): void {
    const location = this.getCurrentLocation();
    this.updateCallbacks.forEach(callback => callback(location));
  }
}

export default LocationSimulator;