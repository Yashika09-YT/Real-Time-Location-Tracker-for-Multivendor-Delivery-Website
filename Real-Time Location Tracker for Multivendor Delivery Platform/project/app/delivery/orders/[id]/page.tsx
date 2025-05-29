'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/layout/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Map from '@/components/ui/map';
import { Order, LocationPoint } from '@/lib/types';
import { getOrderById, getCustomerById, getVendorById, updateOrderStatus, updateDeliveryPartnerLocation } from '@/lib/data';
import { LocationSimulator } from '@/lib/location-simulator';
import socketClient from '@/lib/socket';
import { ArrowLeft, MapPin, Package, ArrowRight, CheckCircle, Check, Map as MapIcon, Navigation, Truck } from 'lucide-react';
import Link from 'next/link';

export default function DeliveryOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [locationSimulator, setLocationSimulator] = useState<LocationSimulator | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatorSpeed, setSimulatorSpeed] = useState<number[]>([1]);
  const [useRealLocation, setUseRealLocation] = useState(true);
  
  useEffect(() => {
    if (params?.id) {
      const orderId = typeof params.id === 'string' ? params.id : params.id[0];
      const fetchedOrder = getOrderById(orderId);
      
      if (fetchedOrder) {
        setOrder(fetchedOrder);
        
        const customerData = getCustomerById(fetchedOrder.customerId);
        setCustomer(customerData);
        
        const vendorData = getVendorById(fetchedOrder.vendorId);
        setVendor(vendorData);
        
        // Initialize location simulator
        const simulator = new LocationSimulator(
          fetchedOrder.pickupLocation,
          fetchedOrder.deliveryLocation
        );
        
        setLocationSimulator(simulator);
      }
    }
  }, [params]);
  
  useEffect(() => {
    let watchId: number;
    
    const successCallback = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const newLocation = {
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      };
      
      setCurrentLocation(newLocation);
      
      // If we have an order and we're not simulating, update the location
      if (order && !isSimulating) {
        updateDeliveryPartnerLocation(order.deliveryPartnerId || '', newLocation);
        
        // Emit location update via socket
        socketClient.sendLocationUpdate({
          orderId: order.id,
          deliveryPartnerId: order.deliveryPartnerId || '',
          location: newLocation,
        });
      }
    };
    
    const errorCallback = (error: GeolocationPositionError) => {
      console.error('Error getting location:', error);
      // Use simulated location as fallback
      if (!isSimulating) {
        const simulatedLocation = {
          latitude: order?.pickupLocation.latitude || 40.7128,
          longitude: order?.pickupLocation.longitude || -74.006,
          timestamp: new Date().toISOString(),
        };
        setCurrentLocation(simulatedLocation);
      }
    };
    
    if (useRealLocation && navigator.geolocation && !isSimulating) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
      
      // Watch for position changes
      watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000,
      });
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [order, isSimulating, useRealLocation]);
  
  useEffect(() => {
    if (locationSimulator && isSimulating) {
      // Update simulator speed
      locationSimulator.setSpeedFactor(simulatorSpeed[0]);
      
      // Set up callback to update location
      const handleLocationUpdate = (location: LocationPoint) => {
        setCurrentLocation(location);
        
        if (order) {
          // Update delivery partner location
          updateDeliveryPartnerLocation(order.deliveryPartnerId || '', location);
          
          // Emit location update via socket
          socketClient.sendLocationUpdate({
            orderId: order.id,
            deliveryPartnerId: order.deliveryPartnerId || '',
            location,
          });
        }
      };
      
      // Register callback
      locationSimulator.onUpdate(handleLocationUpdate);
      
      // Start simulator
      locationSimulator.start(2000);
      
      return () => {
        locationSimulator.stop();
        locationSimulator.offUpdate(handleLocationUpdate);
      };
    }
  }, [locationSimulator, isSimulating, simulatorSpeed, order]);
  
  const handleStartDelivery = () => {
    if (!order) return;
    
    // Update order status
    const updatedOrder = updateOrderStatus(order.id, 'picked');
    if (updatedOrder) {
      setOrder(updatedOrder);
      
      // Emit status update via socket
      socketClient.updateOrderStatus(order.id, 'picked');
      socketClient.startDelivery(order.id);
      
      // Start location simulation
      setIsSimulating(true);
    }
  };
  
  const handleInTransit = () => {
    if (!order) return;
    
    // Update order status
    const updatedOrder = updateOrderStatus(order.id, 'in-transit');
    if (updatedOrder) {
      setOrder(updatedOrder);
      
      // Emit status update via socket
      socketClient.updateOrderStatus(order.id, 'in-transit');
    }
  };
  
  const handleCompleteDelivery = () => {
    if (!order) return;
    
    // Update order status
    const updatedOrder = updateOrderStatus(order.id, 'delivered');
    if (updatedOrder) {
      setOrder(updatedOrder);
      
      // Emit status update via socket
      socketClient.updateOrderStatus(order.id, 'delivered');
      
      // Stop location simulation
      setIsSimulating(false);
      if (locationSimulator) {
        locationSimulator.stop();
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/delivery/dashboard');
      }, 2000);
    }
  };
  
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'assigned': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'picked': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      'in-transit': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'delivered': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };
  
  if (!order || !customer || !vendor) {
    return (
      <Layout>
        <div className="container py-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline\" size="icon\" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Loading Order...</h1>
          </div>
        </div>
      </Layout>
    );
  }
  
  const mapPoints = [];
  
  // Add pickup location
  mapPoints.push({
    position: [order.pickupLocation.latitude, order.pickupLocation.longitude] as [number, number],
    title: 'Pickup Location',
    description: vendor?.storeName || 'Vendor Location',
  });
  
  // Add delivery location
  mapPoints.push({
    position: [order.deliveryLocation.latitude, order.deliveryLocation.longitude] as [number, number],
    title: 'Delivery Location',
    description: customer?.address || 'Customer Address',
  });
  
  // Add current location if available
  if (currentLocation) {
    mapPoints.push({
      position: [currentLocation.latitude, currentLocation.longitude] as [number, number],
      title: 'Your Current Location',
      description: 'This is where you are now',
    });
  }
  
  const center = currentLocation 
    ? [currentLocation.latitude, currentLocation.longitude] as [number, number]
    : [order.pickupLocation.latitude, order.pickupLocation.longitude] as [number, number];
  
  return (
    <Layout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Delivery: Order #{order.id}</h1>
              <p className="text-muted-foreground">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          
          <Badge variant="outline" className={`${getStatusColor(order.status)} border-0 text-sm px-3 py-1`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Order Details and Map */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapIcon className="mr-2 h-5 w-5" />
                  Live Tracking Map
                </CardTitle>
                <CardDescription>
                  Track your current location relative to pickup and delivery points
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Map
                  center={center}
                  points={mapPoints}
                  className="w-full rounded-md overflow-hidden border"
                  height="350px"
                  followActivePoint={true}
                  activePointIndex={mapPoints.findIndex(p => 
                    currentLocation && 
                    p.position[0] === currentLocation.latitude && 
                    p.position[1] === currentLocation.longitude
                  )}
                />
                
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">Location Tracking</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="location-mode" className={useRealLocation ? 'text-primary' : 'text-muted-foreground'}>
                        {useRealLocation ? 'Real GPS' : 'Simulation'}
                      </Label>
                      <Switch 
                        id="location-mode"
                        checked={!useRealLocation}
                        onCheckedChange={(checked) => {
                          setUseRealLocation(!checked);
                          if (checked) {
                            // Switching to simulation mode
                            if (locationSimulator && order.status === 'picked') {
                              setIsSimulating(true);
                            }
                          } else {
                            // Switching to real GPS mode
                            setIsSimulating(false);
                            if (locationSimulator) {
                              locationSimulator.stop();
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {!useRealLocation && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="simulator-speed">Simulation Speed</Label>
                        <span className="text-sm">{simulatorSpeed[0]}x</span>
                      </div>
                      <Slider 
                        id="simulator-speed"
                        min={0.5}
                        max={5}
                        step={0.5}
                        value={simulatorSpeed}
                        onValueChange={setSimulatorSpeed}
                        disabled={!isSimulating}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant="outline" className={`${getStatusColor(order.status)} border-0`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Order Date</span>
                    <span className="text-sm">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  
                  {order.estimatedDeliveryTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Estimated Delivery</span>
                      <span className="text-sm">{new Date(order.estimatedDeliveryTime).toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm">{item.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">×{item.quantity}</span>
                        </div>
                        <span className="text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column: Actions and Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Actions</CardTitle>
                <CardDescription>
                  Update the status of this delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.status === 'assigned' && (
                  <Button 
                    className="w-full" 
                    onClick={handleStartDelivery}
                    disabled={isSimulating}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Pick Up Order
                  </Button>
                )}
                
                {order.status === 'picked' && (
                  <Button 
                    className="w-full" 
                    onClick={handleInTransit}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Start Transit
                  </Button>
                )}
                
                {order.status === 'in-transit' && (
                  <Button 
                    className="w-full"
                    variant="default" 
                    onClick={handleCompleteDelivery}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Delivery
                  </Button>
                )}
                
                {order.status === 'delivered' && (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    <p className="font-medium">Delivery Completed</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      This order has been successfully delivered
                    </p>
                    
                    <Link href="/delivery/dashboard">
                      <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Navigation className="mr-2 h-5 w-5" />
                  Delivery Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <h4 className="font-medium">Pickup Location</h4>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mt-0.5 mr-2 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-medium">{vendor.storeName}</p>
                        <p className="text-sm text-muted-foreground">{vendor.address}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="space-y-2 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <h4 className="font-medium">Delivery Location</h4>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mt-0.5 mr-2 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="mr-2 h-5 w-5" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={customer.avatar} />
                    <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Address</span>
                    <span className="text-sm">{customer.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}