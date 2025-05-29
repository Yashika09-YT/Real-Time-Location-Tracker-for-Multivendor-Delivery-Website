import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, PackageOpen, Truck, UserCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                Real-time Delivery Tracking
              </h1>
              <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                Track your orders in real-time with our multi-vendor marketplace platform. Connect vendors, delivery partners, and customers seamlessly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login?role=customer" passHref>
                <Button size="lg" className="gap-2">
                  <UserCircle className="h-5 w-5" />
                  I'm a Customer
                </Button>
              </Link>
              <Link href="/login?role=vendor" passHref>
                <Button size="lg" variant="outline" className="gap-2">
                  <PackageOpen className="h-5 w-5" />
                  I'm a Vendor
                </Button>
              </Link>
              <Link href="/login?role=delivery" passHref>
                <Button size="lg" variant="outline" className="gap-2">
                  <Truck className="h-5 w-5" />
                  I'm a Delivery Partner
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl opacity-50"></div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Vendor Feature */}
            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-white dark:bg-gray-950 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <PackageOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">For Vendors</h3>
              <p className="text-muted-foreground">Manage orders and assign delivery partners from a single dashboard. Monitor all deliveries in real-time.</p>
            </div>
            
            {/* Delivery Feature */}
            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-white dark:bg-gray-950 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Truck className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold">For Delivery Partners</h3>
              <p className="text-muted-foreground">Receive order assignments and navigate to pickup and delivery locations with real-time GPS tracking.</p>
            </div>
            
            {/* Customer Feature */}
            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-white dark:bg-gray-950 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <MapPin className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold">For Customers</h3>
              <p className="text-muted-foreground">Track your order in real-time on a live map. Know exactly when your delivery will arrive.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How it Works */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">1</div>
                <h3 className="font-semibold text-xl">Place an Order</h3>
              </div>
              <p className="text-muted-foreground">Customers place orders from their favorite vendors in our marketplace.</p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">2</div>
                <h3 className="font-semibold text-xl">Vendor Assigns Delivery</h3>
              </div>
              <p className="text-muted-foreground">Vendors receive the order and assign it to an available delivery partner.</p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">3</div>
                <h3 className="font-semibold text-xl">Track in Real-Time</h3>
              </div>
              <p className="text-muted-foreground">Customers can track their delivery in real-time on an interactive map.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span className="font-semibold">TrackEase</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 md:mt-0">
              © 2025 TrackEase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}