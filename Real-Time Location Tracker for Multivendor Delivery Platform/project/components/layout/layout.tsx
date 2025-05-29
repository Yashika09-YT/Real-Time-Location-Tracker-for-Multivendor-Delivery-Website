'use client';

import { ReactNode, useEffect, useState } from 'react';
import NavBar from './nav-bar';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, isLoggedIn } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in for protected routes
    const protectedPaths = [
      '/vendor', 
      '/delivery', 
      '/customer',
      '/track'
    ];
    
    const isProtectedRoute = protectedPaths.some(path => 
      pathname?.startsWith(path)
    );
    
    // Login page should redirect to role-specific dashboard if already logged in
    if (pathname === '/login' && isLoggedIn()) {
      const user = getCurrentUser();
      if (user) {
        router.replace(`/${user.role}/dashboard`);
      }
    }
    
    // For protected routes, redirect to login if not logged in
    else if (isProtectedRoute && !isLoggedIn()) {
      router.replace('/login');
    }
    
    // If we're on a role-specific route, check if user has that role
    else if (isLoggedIn() && pathname && pathname !== '/') {
      const user = getCurrentUser();
      const roleSpecificPaths = ['/vendor/', '/delivery/', '/customer/'];
      
      for (const path of roleSpecificPaths) {
        if (pathname.startsWith(path) && user && !pathname.startsWith(`/${user.role}/`)) {
          router.replace(`/${user.role}/dashboard`);
          break;
        }
      }
    }
    
    setLoading(false);
  }, [pathname, router]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}