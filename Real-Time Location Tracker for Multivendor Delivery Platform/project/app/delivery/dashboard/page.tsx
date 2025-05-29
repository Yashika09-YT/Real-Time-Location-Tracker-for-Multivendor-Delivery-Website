'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Map from '@/components/ui/map';
import { DeliveryPartner, Order } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';
import { getOrdersByDeliveryPartnerId, updateDeliveryPartnerLocation, deliveryPartners } from '@/lib/data';
import { Package, MapPin, Clock, CheckCircle, UserCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function DeliveryDashboard() {
  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  
  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === 'delivery') {
      const partner = deliveryPartners.find(p => p.id === user.id);
      if (partner) {
        setDeliveryPartner(partner);
        setIsAvailable(partner.isAvailable);
        
        // Get assigned orders
        const partnerOrders = getOrdersByDeliveryPartnerId(partner.id);
        setOrders(partnerOrders);
      }
    }
  }, []);
  
  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    if (deliveryPartner) {
      deliveryPartner.isAvailable = !isAvailable;
    }
  };
  
  // Update geolocation
  useEffect(() => {
    let watchId: number;
    
    const successCallback = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      if (deliveryPartner) {
        updateDeliveryPartnerLocation(deliveryPartner.id, { latitude, longitude });
        setDeliveryPartner({
          ...deliveryPartner,
          currentLocation: {
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
          }
        });
      }
    };
    
    const errorCallback = (error: GeolocationPositionError) => {
      console.error('Error getting location:', error);
      // Use simulated location as fallback
      if (deliveryPartner) {
        const simulatedLocation = {
          latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
          longitude: -74.006 + (Math.random() - 0.5) * 0.01,
        };
        updateDeliveryPartnerLocation(deliveryPartner.id, simulatedLocation);
        setDeliveryPartner({
          ...deliveryPartner,
          currentLocation: {
            ...simulatedLocation,
            timestamp: new Date().toISOString(),
          }
        });
      }
    };
    
    // Check if geolocation is supported
    if (navigator.geolocation) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
      
      // Watch for position changes
      watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: A27000,
      });
    } else {
      console.log('Geolocation is not supported by this browser.');
      // Use simulated location as fallback
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [deliveryPartner]);
  
  const mapPoints = deliveryPartner?.currentLocation 
    ? [
        {
          position: [deliveryPartner.currentLocation.latitude, deliveryPartner.currentLocation.longitude] as [number, number],
          title: 'Your Current Location',
          description: 'This is where you are now',
        }
      ]
    : [];
  
  const getActiveOrders = () => orders.filter(order => 
    ['assigned', 'picked', 'in-transit'].includes(order.status)
  );
    
  const activeOrders = getActiveOrders();
    
  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Delivery Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your deliveries and track your location
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="available" 
              checked={isAvailable} 
              onCheckedChange={toggleAvailability} 
            />
            <Label htmlFor="available">Available for Orders</Label>
          </div>
        </div>
        
        {/* Current Location Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Your Current Location
            </CardTitle>
            <CardDescription>
              This is where you are currently located
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Map
              center={deliveryPartner?.currentLocation 
                ? [deliveryPartner.currentLocation.latitude, deliveryPartner.currentLocation.longitude]
                : [40.7128, -74.006]
              }
              points={mapPoints}
              className="w-full rounded-md overflow-hidden border"
              height="300px"
            />
            
            <div className="mt-4 text-sm text-muted-foreground">
              {deliveryPartner?.currentLocation ? (
                <p>
                  Last updated: {new Date(deliveryPartner.currentLocation.timestamp || '').toLocaleString()}
                </p>
              ) : (
                <p>Location data not available. Please enable location services.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Active Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Active Orders
            </CardTitle>
            <CardDescription>
              Orders that require your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                <p className="text-muted-foreground">No active orders right now</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-semibold">Order #{order.id}</h4>
                          <div className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                          <Badge variant="outline" className={`bg-${
                            order.status === 'assigned' ? 'blue' : 
                            order.status === 'picked' ? 'indigo' : 
                            'purple'
                          }-100 text-${
                            order.status === 'assigned' ? 'blue' : 
                            order.status === 'picked' ? 'indigo' : 
                            'purple'
                          }-800 dark:bg-${
                            order.status === 'assigned' ? 'blue' : 
                            order.status === 'picked' ? 'indigo' : 
                            'purple'
                          }-900/20 dark:text-${
                            order.status === 'assigned' ? 'blue' : 
                            order.status === 'picked' ? 'indigo' : 
                            'purple'
                          }-400 border-0 mt-1`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm md:text-right">
                          <div className="font-medium">${order.totalAmount.toFixed(2)}</div>
                          <div className="text-muted-foreground">{order.items.length} items</div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link href={`/delivery/orders/${order.id}`}>
                            <Button size="sm">Manage Delivery</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-10 w-10 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Assigned</p>
                  <h3 className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'assigned').length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-10 w-10 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                  <h3 className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'in-transit').length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <h3 className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'delivered').length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}