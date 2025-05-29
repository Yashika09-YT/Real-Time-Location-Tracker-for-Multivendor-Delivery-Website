// User types
export type UserRole = 'vendor' | 'delivery' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface Vendor extends User {
  role: 'vendor';
  storeName: string;
  address: string;
}

export interface DeliveryPartner extends User {
  role: 'delivery';
  isAvailable: boolean;
  currentLocation: LocationPoint | null;
  assignedOrders: Order[];
}

export interface Customer extends User {
  role: 'customer';
  address: string;
}

// Order types
export type OrderStatus = 'pending' | 'assigned' | 'picked' | 'in-transit' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  deliveryPartnerId?: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  pickupLocation: LocationPoint;
  deliveryLocation: LocationPoint;
  totalAmount: number;
  estimatedDeliveryTime?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// Location types
export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp?: string;
}

export interface LocationUpdate {
  orderId: string;
  deliveryPartnerId: string;
  location: LocationPoint;
}

// Socket events
export type SocketEvent = 
  | 'connect'
  | 'disconnect'
  | 'location-update'
  | 'order-status-update'
  | 'order-assigned'
  | 'delivery-started';