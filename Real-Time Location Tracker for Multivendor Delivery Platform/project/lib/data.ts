import { Customer, DeliveryPartner, Order, User, Vendor } from './types';
import { v4 as uuidv4 } from 'uuid';

// Sample Vendors
export const vendors: Vendor[] = [
  {
    id: '1',
    name: 'Alex Restaurants',
    email: 'alex@restaurant.com',
    role: 'vendor',
    storeName: 'Alex Restaurants',
    address: '123 Main St, New York, NY',
    avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '2',
    name: 'Lisa Bakery',
    email: 'lisa@bakery.com',
    role: 'vendor',
    storeName: 'Lisa Bakery',
    address: '456 Elm St, New York, NY',
    avatar: 'https://images.pexels.com/photos/7389136/pexels-photo-7389136.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
];

// Sample Delivery Partners
export const deliveryPartners: DeliveryPartner[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@delivery.com',
    role: 'delivery',
    phone: '+1234567890',
    isAvailable: true,
    currentLocation: {
      latitude: 40.7128,
      longitude: -74.006,
      timestamp: new Date().toISOString(),
    },
    assignedOrders: [],
    avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@delivery.com',
    role: 'delivery',
    phone: '+1987654321',
    isAvailable: true,
    currentLocation: {
      latitude: 40.7148,
      longitude: -74.012,
      timestamp: new Date().toISOString(),
    },
    assignedOrders: [],
    avatar: 'https://images.pexels.com/photos/3795094/pexels-photo-3795094.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
];

// Sample Customers
export const customers: Customer[] = [
  {
    id: '1',
    name: 'Emily Johnson',
    email: 'emily@example.com',
    role: 'customer',
    address: '789 Pine St, New York, NY',
    avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '2',
    name: 'Michael Brown',
    email: 'michael@example.com',
    role: 'customer',
    address: '101 Oak St, New York, NY',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
];

// Sample Orders
export const orders: Order[] = [
  {
    id: '1',
    customerId: '1',
    vendorId: '1',
    deliveryPartnerId: '1',
    items: [
      { id: '1', name: 'Burger', quantity: 2, price: 12.99 },
      { id: '2', name: 'Fries', quantity: 1, price: 4.99 },
    ],
    status: 'assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutes ago
    pickupLocation: {
      latitude: 40.7128,
      longitude: -74.006,
    },
    deliveryLocation: {
      latitude: 40.7138,
      longitude: -74.013,
    },
    totalAmount: 30.97,
    estimatedDeliveryTime: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 minutes from now
  },
  {
    id: '2',
    customerId: '2',
    vendorId: '2',
    items: [
      { id: '3', name: 'Croissant', quantity: 4, price: 3.50 },
      { id: '4', name: 'Coffee', quantity: 2, price: 4.50 },
    ],
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    pickupLocation: {
      latitude: 40.7148,
      longitude: -74.012,
    },
    deliveryLocation: {
      latitude: 40.7158,
      longitude: -74.022,
    },
    totalAmount: 23.00,
  },
  {
    id: '3',
    customerId: '1',
    vendorId: '1',
    items: [
      { id: '5', name: 'Pizza', quantity: 1, price: 14.99 },
      { id: '6', name: 'Soda', quantity: 2, price: 2.50 },
    ],
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    pickupLocation: {
      latitude: 40.7128,
      longitude: -74.006,
    },
    deliveryLocation: {
      latitude: 40.7168,
      longitude: -74.016,
    },
    totalAmount: 19.99,
  },
];

// Helper function to get all users
export const getAllUsers = (): User[] => {
  return [...vendors, ...deliveryPartners, ...customers];
};

// Helper function to get all orders
export const getAllOrders = (): Order[] => {
  return orders;
};

// Helper function to find user by email
export const findUserByEmail = (email: string): User | undefined => {
  return getAllUsers().find(user => user.email === email);
};

// Helper function to get orders by vendor ID
export const getOrdersByVendorId = (vendorId: string): Order[] => {
  return orders.filter(order => order.vendorId === vendorId);
};

// Helper function to get orders by delivery partner ID
export const getOrdersByDeliveryPartnerId = (deliveryPartnerId: string): Order[] => {
  return orders.filter(order => order.deliveryPartnerId === deliveryPartnerId);
};

// Helper function to get orders by customer ID
export const getOrdersByCustomerId = (customerId: string): Order[] => {
  return orders.filter(order => order.customerId === customerId);
};

// Helper function to get vendor by ID
export const getVendorById = (id: string): Vendor | undefined => {
  return vendors.find(vendor => vendor.id === id);
};

// Helper function to get delivery partner by ID
export const getDeliveryPartnerById = (id: string): DeliveryPartner | undefined => {
  return deliveryPartners.find(partner => partner.id === id);
};

// Helper function to get customer by ID
export const getCustomerById = (id: string): Customer | undefined => {
  return customers.find(customer => customer.id === id);
};

// Helper function to get order by ID
export const getOrderById = (id: string): Order | undefined => {
  return orders.find(order => order.id === id);
};

// Helper function to update order status
export const updateOrderStatus = (orderId: string, status: Order['status']): Order | undefined => {
  const orderIndex = orders.findIndex(order => order.id === orderId);
  if (orderIndex === -1) return undefined;
  
  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  
  return orders[orderIndex];
};

// Helper function to assign delivery partner to order
export const assignDeliveryPartner = (orderId: string, deliveryPartnerId: string): Order | undefined => {
  const orderIndex = orders.findIndex(order => order.id === orderId);
  if (orderIndex === -1) return undefined;
  
  orders[orderIndex].deliveryPartnerId = deliveryPartnerId;
  orders[orderIndex].status = 'assigned';
  orders[orderIndex].updatedAt = new Date().toISOString();
  
  return orders[orderIndex];
};

// Helper function to update delivery partner location
export const updateDeliveryPartnerLocation = (
  deliveryPartnerId: string, 
  location: { latitude: number; longitude: number }
): DeliveryPartner | undefined => {
  const partnerIndex = deliveryPartners.findIndex(partner => partner.id === deliveryPartnerId);
  if (partnerIndex === -1) return undefined;
  
  deliveryPartners[partnerIndex].currentLocation = {
    ...location,
    timestamp: new Date().toISOString(),
  };
  
  return deliveryPartners[partnerIndex];
};

// Add a new order
export const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
  const now = new Date().toISOString();
  const newOrder: Order = {
    ...orderData,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  
  orders.push(newOrder);
  return newOrder;
};