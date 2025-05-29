'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Map from '@/components/ui/map';
import { LocationPoint, Order } from '@/lib/types';
import { getOrderById, getCustomerById, getVendorById, getDeliveryPartnerById, getAllOrders } from '@/lib/data';
import socketClient from '@/lib/socket';
import { ArrowLeft, Clock, MapPin, Package, Phone, CheckCircle, Truck, Store } from 'lucide-react';
import Link from 'next/link';

// This function tells Next.js which dynamic paths to pre-render
export async function generateStaticParams() {
  const orders = getAllOrders();
  return orders.map((order) => ({
    id: order.id,
  }));
}

export default function TrackOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [deliveryPartner, setDeliveryPartner] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  
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
        
        if (fetchedOrder.deliveryPartnerId) {
          const partnerData = getDeliveryPartnerById(fetchedOrder.deliveryPartnerId);
          setDeliveryPartner(partnerData);
          
          if (partnerData?.currentLocation) {
            setCurrentLocation(partnerData.currentLocation);
          }
        }
      }
    }
  }, [params]);
  
  useEffect(() => {
    // Listen for location updates
    const handleLocationUpdate = (data: any) => {
      if (data.orderId === order?.id) {
        setCurrentLocation(data.location);
      }
    };
    
    // Listen for status updates
    const handleStatusUpdate = (data: any) => {
      if (data.orderId === order?.id) {
        setOrder(prevOrder => prevOrder ? { ...prevOrder, status: data.status } : null);
      }
    };
    
    socketClient.on('location-update', handleLocationUpdate);
    socketClient.on('order-status-update', handleStatusUpdate);
    
    return () => {
      socketClient.off('location-update', handleLocationUpdate);
      socketClient.off('order-status-update', handleStatusUpdate);
    };
  }, [order]);
  
  const getDeliveryProgress = () => {
    switch (order?.status) {
      case 'pending':
        return 0;
      case 'assigned':
        return 25;
      case 'picked':
        return 50;
      case 'in-transit':
        return 75;
      case 'delivered':
        return 100;
      default:
        return 0;
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
  
  const getStatusMessage = () => {
    switch (order?.status) {
      case 'pending':
        return 'Waiting for restaurant to confirm';
      case 'assigned':
        return 'Delivery partner assigned, heading to pick up';
      case 'picked':
        return 'Order picked up, preparing for delivery';
      case 'in-transit':
        return 'On the way to your location';
      case 'delivered':
        return 'Order has been delivered';
      case 'cancelled':
        return 'Order was cancelled';
      default:
        return 'Processing your order';
    }
  };
  
  const getEstimatedTime = () => {
    if (!order?.estimatedDeliveryTime) return 'Calculating...';
    
    const estimatedTime = new Date(order.estimatedDeliveryTime);
    const now = new Date();
    
    if (estimatedTime < now) return 'Arriving soon';
    
    const diffMinutes = Math.round((estimatedTime.getTime() - now.getTime()) / (1000 * 60));
    return `${diffMinutes} minutes`;
  };
  
  if (!order) {
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
  if (vendor) {
    mapPoints.push({
      position: [order.pickupLocation.latitude, order.pickupLocation.longitude] as [number, number],
      title: vendor.storeName,
      description: 'Pickup Location',
    });
  }
  
  // Add delivery location
  if (customer) {
    mapPoints.push({
      position: [order.deliveryLocation.latitude, order.deliveryLocation.longitude] as [number, number],
      title: 'Delivery Location',
      description: customer.address,
    });
  }
  
  // Add current location of delivery partner if available
  if (currentLocation) {
    mapPoints.push({
      position: [currentLocation.latitude, currentLocation.longitude] as [number, number],
      title: deliveryPartner ? `${deliveryPartner.name} (Delivery Partner)` : 'Delivery Partner',
      description: 'Current Location',
    });
  }
  
  const center = currentLocation 
    ? [currentLocation.latitude, currentLocation.longitude] as [number, number]
    : (vendor ? [order.pickupLocation.latitude, order.pickupLocation.longitude] as [number, number] 
       : [order.deliveryLocation.latitude, order.deliveryLocation.longitude] as [number, number]);
  
  return (
    <Layout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/customer/orders')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tracking Order #{order.id}</h1>
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
          {/* Left Column: Tracking Map */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle>Live Tracking</CardTitle>
                <CardDescription>
                  Follow your order in real-time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Map
                  center={center}
                  points={mapPoints}
                  className="w-full h-[400px] md:h-[500px]"
                  followActivePoint={true}
                  activePointIndex={mapPoints.findIndex(p => 
                    currentLocation && 
                    p.position[0] === currentLocation.latitude && 
                    p.position[1] === currentLocation.longitude
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Delivery Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Order Placed</span>
                    <span>Delivered</span>
                  </div>
                  <Progress value={getDeliveryProgress()} className="h-2" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`font-medium ${order.status === 'pending' ? 'text-primary' : ''}`}>
                        Order Confirmed
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-1 h-0.5 bg-muted"></div>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                      order.status !== 'pending' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      order.status === 'assigned' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`font-medium ${order.status === 'assigned' ? 'text-primary' : ''}`}>
                        Pickup In Progress
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.status !== 'pending' ? 'Delivery partner assigned' : 'Waiting for assignment'}
                      </p>
                    </div>
                    <div className="flex-1 h-0.5 bg-muted"></div>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                      ['picked', 'in-transit', 'delivered'].includes(order.status) ? 
                      'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      order.status === 'in-transit' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`font-medium ${order.status === 'in-transit' ? 'text-primary' : ''}`}>
                        On The Way
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.status === 'in-transit' 
                          ? `Estimated arrival: ${getEstimatedTime()}`
                          : ['delivered'].includes(order.status)
                          ? 'Completed'
                          : 'Waiting'}
                      </p>
                    </div>
                    <div className="flex-1 h-0.5 bg-muted"></div>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                      order.status === 'delivered' ? 
                      'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      order.status === 'delivered' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`font-medium ${order.status === 'delivered' ? 'text-primary' : ''}`}>
                        Delivered
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.status === 'delivered' 
                          ? 'Your order has been delivered successfully'
                          : 'Waiting for delivery confirmation'}
                      </p>
                    </div>
                    <div className="flex-1 invisible"></div>
                    <div className="invisible h-6 w-6"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column: Order Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-medium mb-2">{getStatusMessage()}</h3>
                  
                  {['in-transit', 'picked'].includes(order.status) && (
                    <p className="text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      Estimated arrival: {getEstimatedTime()}
                    </p>
                  )}
                </div>
                
                {deliveryPartner && (
                  <div>
                    <h3 className="font-medium mb-2">Delivery Partner</h3>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={deliveryPartner.avatar} />
                        <AvatarFallback>{deliveryPartner.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{deliveryPartner.name}</p>
                        <div className="flex items-center">
                          {deliveryPartner.phone && (
                            <div className="flex items-center mr-4 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {deliveryPartner.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="mr-2 h-5 w-5" />
                  Vendor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vendor ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={vendor.avatar} />
                        <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{vendor.storeName}</p>
                        <p className="text-sm text-muted-foreground">{vendor.email}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Address</span>
                        <span className="text-sm">{vendor.address}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Vendor information not available</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
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
        </div>
      </div>
    </Layout>
  );
}