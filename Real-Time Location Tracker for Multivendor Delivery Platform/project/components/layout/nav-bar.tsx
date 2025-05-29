'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCurrentUser, logout } from '@/lib/auth';
import { MapPin, Package, User, LogOut, Home, Map, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { User as UserType } from '@/lib/types';

export default function NavBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserType | null>(null);
  
  useEffect(() => {
    setUser(getCurrentUser());
  }, []);
  
  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.href = '/';
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  const getRoleBasedLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'vendor':
        return [
          { href: '/vendor/dashboard', label: 'Dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
          { href: '/vendor/orders', label: 'Orders', icon: <Package className="mr-2 h-4 w-4" /> },
        ];
      case 'delivery':
        return [
          { href: '/delivery/dashboard', label: 'Dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
          { href: '/delivery/orders', label: 'Orders', icon: <Package className="mr-2 h-4 w-4" /> },
          { href: '/delivery/map', label: 'Map', icon: <Map className="mr-2 h-4 w-4" /> },
        ];
      case 'customer':
        return [
          { href: '/customer/dashboard', label: 'Dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
          { href: '/customer/orders', label: 'Orders', icon: <Package className="mr-2 h-4 w-4" /> },
        ];
      default:
        return [];
    }
  };
  
  const roleBasedLinks = getRoleBasedLinks();
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <MapPin className="h-6 w-6" />
            <span className="font-bold text-xl">TrackEase</span>
          </Link>
        </div>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {roleBasedLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <Link href={link.href} legacyBehavior passHref>
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(), 
                      pathname === link.href ? "bg-accent text-accent-foreground" : ""
                    )}
                  >
                    {link.icon}
                    {link.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="flex-1" />
        
        {user ? (
          <div className="flex items-center gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user.name}</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[200px] p-2">
                      <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                        Signed in as {user.role}
                      </div>
                      <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" passHref>
              <Button variant="ghost">Login</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}