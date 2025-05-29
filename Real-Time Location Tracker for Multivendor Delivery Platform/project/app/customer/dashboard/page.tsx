'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingBag, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Order } from '@/lib/types';
import { getOrdersByCustomerId } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === 'customer') {
      const customerOrders = getOrdersByCustomerId(user.id);
      setOrders(customerOrders);
      
      // Filter active orders (not delivered or cancelled)
      const active = customerOrders.filter(
        order => !['delivered', 'cancelled'].includes(order.status)
      );
      setActiveOrders(active);
    }
  }, []);
  
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
  
  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Dashboard</h1>
            <p className="text-muted-foreground">
              Track and manage your orders
            </p>
          </div>
          
          <Link href="/customer/orders">
            <Button>View All Orders</Button>
          </Link>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-10 w-10 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <h3 className="text-2xl font-bold">{orders.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-10 w-10 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                  <h3 className="text-2xl font-bold">{activeOrders.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <h3 className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'delivered').length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Active Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Active Orders
            </CardTitle>
            <CardDescription>
              Your current orders in progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                <p className="text-muted-foreground">No active orders</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Your active orders will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-semibold">Order #{order.id}</h4>
                          <div className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                          <Badge variant="outline" className={`${getStatusColor(order.status)} border-0 mt-1`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col md:items-end justify-between">
                          <div className="font-medium">${order.totalAmount.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.length} items
                          </div>
                          
                          <Link href={`/track/${order.id}`}>
                            <Button size="sm" className="mt-2 flex gap-1 items-center">
                              <MapPin className="h-4 w-4" />
                              Track Order
                            </Button>
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
        
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/customer/orders">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                <p className="text-muted-foreground">No orders found</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Your order history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 3).map(order => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-semibold">Order #{order.id}</h4>
                          <div className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                          <Badge variant="outline" className={`${getStatusColor(order.status)} border-0 mt-1`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col md:items-end justify-between">
                          <div className="font-medium">${order.totalAmount.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.length} items
                          </div>
                          
                          {['in-transit', 'picked', 'assigned'].includes(order.status) ? (
                            <Link href={`/track/${order.id}`}>
                              <Button size="sm" variant="outline" className="mt-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                Track
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/track/${order.id}`}>
                              <Button size="sm" variant="outline" className="mt-2">
                                View Details
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}