'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/layout/layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Map from '@/components/ui/map';
import { DeliveryPartner, Order } from '@/lib/types';
import { getOrderById, getCustomerById, deliveryPartners, assignDeliveryPartner as assignPartner, updateOrderStatus } from '@/lib/data';
import socketClient from '@/lib/socket';
import { ArrowLeft, MapPin, Package, CheckCircle, User, Calendar, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [selectedDeliveryPartnerId, setSelectedDeliveryPartnerId] = useState<string>('');
  const [availablePartners, setAvailablePartners] = useState<DeliveryPartner[]>([]);
  
  useEffect(() => {
    if (params?.id) {
      const orderId = typeof params.id === 'string' ? params.id : params.id[0];
      const fetchedOrder = getOrderById(orderId);
      
      if (fetchedOrder) {
        setOrder(fetchedOrder);
        setSelectedDeliveryPartnerId(fetchedOrder.deliveryPartnerId || '');
        
        const customerData = getCustomerById(fetchedOrder.customerId);
        setCustomer(customerData);
      }
      
      // Filter delivery partners who are available
      setAvailablePartners(deliveryPartners.filter(dp => dp.isAvailable));
    }
  }, [params]);
  
  const handleAssignDeliveryPartner = () => {
    if (!order || !selectedDeliveryPartnerId) return;
    
    const updatedOrder = assignPartner(order.id, selectedDeliveryPartnerId);
    if (updatedOrder) {
      // Simulate sending update via socket
      socketClient.assignDeliveryPartner(order.id, selectedDeliveryPartnerId);
      
      setOrder(updatedOrder);
      
      // Show success message and redirect after a delay
      setTimeout(() => {
        router.push('/vendor/orders');
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
  
  if (!order || !customer) {
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
  
  const mapPoints = [
    {
      position: [order.pickupLocation.latitude, order.pickupLocation.longitude] as [number, number],
      title: 'Pickup Location',
      description: 'Vendor Location',
    },
    {
      position: [order.deliveryLocation.latitude, order.deliveryLocation.longitude] as [number, number],
      title: 'Delivery Location',
      description: customer?.address || 'Customer Address',
    }
  ];
  
  if (order.deliveryPartnerId) {
    const partner = deliveryPartners.find(p => p.id === order.deliveryPartnerId);
    if (partner?.currentLocation) {
      mapPoints.push({
        position: [partner.currentLocation.latitude, partner.currentLocation.longitude] as [number, number],
        title: `${partner.name} (Delivery Partner)`,
        description: 'Current Location',
      });
    }
  }
  
  return (
    <Layout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Order #{order.id}</h1>
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
          {/* Left Column: Order Details */}
          <div className="lg:col-span-2 space-y-6">
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
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Delivery Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Map
                  center={[order.pickupLocation.latitude, order.pickupLocation.longitude]}
                  points={mapPoints}
                  className="w-full rounded-md overflow-hidden border"
                  height="300px"
                />
                
                <div className="space-y-4 mt-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Pickup Location</h4>
                    <p className="text-sm">Vendor Address</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Delivery Location</h4>
                    <p className="text-sm">{customer.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column: Customer & Delivery Partner */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
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
                    <span className="text-sm font-medium">Phone</span>
                    <span className="text-sm">{customer.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Address</span>
                    <span className="text-sm">{customer.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  Delivery Partner
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.deliveryPartnerId ? (
                  <div>
                    {(() => {
                      const partner = deliveryPartners.find(p => p.id === order.deliveryPartnerId);
                      return partner ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={partner.avatar} />
                              <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{partner.name}</p>
                              <p className="text-sm text-muted-foreground">{partner.email}</p>
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Phone</span>
                              <span className="text-sm">{partner.phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Status</span>
                              <Badge variant={partner.isAvailable ? 'outline' : 'secondary'}>
                                {partner.isAvailable ? 'Available' : 'Busy'}
                              </Badge>
                            </div>
                          </div>
                          
                          <Link href={`/track/${order.id}`}>
                            <Button className="w-full">
                              <MapPin className="mr-2 h-4 w-4" />
                              Track Delivery
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground">
                          Delivery partner information not found
                        </p>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-center text-muted-foreground mb-4">
                      No delivery partner assigned yet
                    </p>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="delivery-partner">Assign Delivery Partner</Label>
                        <Select value={selectedDeliveryPartnerId} onValueChange={setSelectedDeliveryPartnerId}>
                          <SelectTrigger id="delivery-partner">
                            <SelectValue placeholder="Select delivery partner" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePartners.map(partner => (
                              <SelectItem key={partner.id} value={partner.id}>
                                {partner.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={handleAssignDeliveryPartner}
                        disabled={!selectedDeliveryPartnerId}
                      >
                        Assign Partner
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}