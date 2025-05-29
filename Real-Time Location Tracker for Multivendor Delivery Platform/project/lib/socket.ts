'use client';

import { io, Socket } from 'socket.io-client';
import { LocationUpdate, SocketEvent } from './types';
import { getCurrentUser } from './auth';

// Note: In a real production environment, this would connect to your backend server
// For this demo, we'll use a mock implementation that simulates socket events

class SocketClient {
  private static instance: SocketClient;
  private socket: Socket | null = null;
  private listeners: Map<SocketEvent, Function[]> = new Map();
  private connected = false;

  private constructor() {
    // This would normally connect to a real socket server
    // socket = io('http://your-backend-url');
    
    // For the demo, we'll simulate socket behavior
    this.simulateConnection();
  }

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  private simulateConnection() {
    // Simulate socket connection
    setTimeout(() => {
      this.connected = true;
      this.emit('connect');
      console.log('Socket connected (simulated)');
    }, 500);
  }

  public on(event: SocketEvent, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    
    // If connecting to an already connected socket, trigger connect event immediately
    if (event === 'connect' && this.connected) {
      callback();
    }
  }

  public off(event: SocketEvent, callback: Function) {
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
      this.listeners.set(event, callbacks);
    }
  }

  public emit(event: SocketEvent, ...args: any[]) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(...args));
  }

  // Simulate sending location updates
  public sendLocationUpdate(locationUpdate: LocationUpdate) {
    console.log('Sending location update (simulated):', locationUpdate);
    
    // Simulate broadcasting to all subscribers
    setTimeout(() => {
      this.emit('location-update', locationUpdate);
    }, 100);
    
    return true;
  }

  // Simulate updating order status
  public updateOrderStatus(orderId: string, status: string) {
    console.log(`Updating order ${orderId} status to ${status} (simulated)`);
    
    // Simulate broadcasting to all subscribers
    setTimeout(() => {
      this.emit('order-status-update', { orderId, status });
    }, 100);
    
    return true;
  }

  // Simulate assigning delivery partner
  public assignDeliveryPartner(orderId: string, deliveryPartnerId: string) {
    console.log(`Assigning order ${orderId} to delivery partner ${deliveryPartnerId} (simulated)`);
    
    // Simulate broadcasting to all subscribers
    setTimeout(() => {
      this.emit('order-assigned', { orderId, deliveryPartnerId });
    }, 100);
    
    return true;
  }

  // Simulate starting delivery
  public startDelivery(orderId: string) {
    console.log(`Starting delivery for order ${orderId} (simulated)`);
    
    // Simulate broadcasting to all subscribers
    setTimeout(() => {
      this.emit('delivery-started', { orderId });
    }, 100);
    
    return true;
  }
}

export const socketClient = SocketClient.getInstance();

export default socketClient;