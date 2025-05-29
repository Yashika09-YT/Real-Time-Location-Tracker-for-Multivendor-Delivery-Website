'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, UserCheck, Clock, AlertTriangle } from 'lucide-react';
import { Order } from '@/lib/types';
import { getOrdersByVendorId } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

export default function VendorDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<{[key: string]: Order[]}>({});
  
  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === 'vendor') {
      const vendorOrders = getOrdersByVendorId(user.id);
      setOrders(vendorOrders);
      
      // Group orders by status
      const groupedOrders: {[key: string]: Order[]} = {};
      vendorOrders.forEach(order => {
        if (!groupedOrders[order.status]) {
          groupedOrders[order.status] = [];
        }
        groupedOrders[order.status].push(order);
      });
      
      setOrdersByStatus(groupedOrders);
    }
  }, []);
  
  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Vendor Dashboard</h1>
          <Link href="/vendor/orders">
            <Button className="ml-auto">View All Orders</Button>
          </Link>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-10 w-10 text-blue-500" />
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
                <Truck className="h-10 w-10 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                  <h3 className="text-2xl font-bold">
                    {ordersByStatus['in-transit']?.length || 0}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-10 w-10 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <h3 className="text-2xl font-bold">
                    {ordersByStatus['delivered']?.length || 0}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-10 w-10 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <h3 className="text-2xl font-bold">
                    {ordersByStatus['pending']?.length || 0}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Your latest orders and their statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-5 w-full max-w-[600px]">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="assigned">Assigned</TabsTrigger>
                <TabsTrigger value="in-transit">In Transit</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                )}
              </TabsContent>
              
              {['pending', 'assigned', 'in-transit', 'delivered'].map(status => (
                <TabsContent key={status} value={status} className="mt-4">
                  {ordersByStatus[status]?.length > 0 ? (
                    <div className="space-y-4">
                      {ordersByStatus[status].map(order => (
                        <OrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-muted-foreground">No {status} orders found</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    'assigned': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    'picked': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    'in-transit': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    'delivered': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-semibold">Order #{order.id}</h4>
            <div className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleString()}
            </div>
            <Badge variant="outline" className={`${statusColors[order.status]} border-0 mt-1`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          
          <div className="space-y-1 text-sm md:text-right">
            <div className="font-medium">${order.totalAmount.toFixed(2)}</div>
            <div className="text-muted-foreground">{order.items.length} items</div>
          </div>
          
          <div className="flex gap-2">
            {order.status === 'pending' && (
              <Link href={`/vendor/orders/${order.id}`}>
                <Button size="sm">Assign Driver</Button>
              </Link>
            )}
            <Link href={`/vendor/orders/${order.id}`}>
              <Button variant="outline" size="sm">View Details</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}