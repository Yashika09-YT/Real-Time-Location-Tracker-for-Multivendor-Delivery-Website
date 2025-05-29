'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, PackageOpen, Truck } from 'lucide-react';
import { autoLogin, isLoggedIn, login } from '@/lib/auth';
import { UserRole } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');
  
  useEffect(() => {
    const roleParam = searchParams?.get('role') as UserRole | null;
    if (roleParam && ['customer', 'vendor', 'delivery'].includes(roleParam)) {
      setRole(roleParam);
    }
    
    // If already logged in, redirect to appropriate dashboard
    if (isLoggedIn()) {
      const user = autoLogin(role);
      if (user) {
        router.push(`/${user.role}/dashboard`);
      }
    }
  }, [router, searchParams, role]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // For demo, just use the auto login function with the selected role
    const user = autoLogin(role);
    
    if (user) {
      router.push(`/${user.role}/dashboard`);
    } else {
      setError('Invalid login credentials');
    }
  };
  
  const handleTabChange = (value: string) => {
    setRole(value as UserRole);
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Choose your account type and sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <Tabs defaultValue={role} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="customer" className="flex flex-col sm:flex-row items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>Customer</span>
              </TabsTrigger>
              <TabsTrigger value="vendor" className="flex flex-col sm:flex-row items-center gap-1">
                <PackageOpen className="h-4 w-4" />
                <span>Vendor</span>
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex flex-col sm:flex-row items-center gap-1">
                <Truck className="h-4 w-4" />
                <span>Delivery</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer">
              <p className="text-sm text-muted-foreground mb-4">
                Sign in as a customer to place orders and track your deliveries.
              </p>
              <p className="text-xs text-muted-foreground mb-4 p-2 bg-muted rounded-md">
                Demo credentials: emily@example.com / password
              </p>
            </TabsContent>
            <TabsContent value="vendor">
              <p className="text-sm text-muted-foreground mb-4">
                Sign in as a vendor to manage your store and assign delivery partners.
              </p>
              <p className="text-xs text-muted-foreground mb-4 p-2 bg-muted rounded-md">
                Demo credentials: alex@restaurant.com / password
              </p>
            </TabsContent>
            <TabsContent value="delivery">
              <p className="text-sm text-muted-foreground mb-4">
                Sign in as a delivery partner to receive and fulfill orders.
              </p>
              <p className="text-xs text-muted-foreground mb-4 p-2 bg-muted rounded-md">
                Demo credentials: john@delivery.com / password
              </p>
            </TabsContent>
          </Tabs>
          
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={role === 'customer' ? 'emily@example.com' : 
                               role === 'vendor' ? 'alex@restaurant.com' : 
                               'john@delivery.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" className="text-xs" type="button">
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
            </div>
            <Button className="w-full mt-6" type="submit">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t px-6 py-4">
          <div className="text-xs text-muted-foreground text-center">
            <p>
              For this demo, you can log in with any email/password.
              <br />
              Just select your role and click Sign In.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}