import { User, UserRole } from './types';
import { findUserByEmail } from './data';

// Mock authentication functions for demo purposes
// In a real application, you would implement proper authentication with JWT or similar

let currentUser: User | null = null;

export const login = (email: string, password: string): User | null => {
  // In a real app, you would verify the password here
  const user = findUserByEmail(email);
  if (user) {
    currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    return user;
  }
  return null;
};

export const logout = (): void => {
  currentUser = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

export const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;
  
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
        return currentUser;
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }
  
  return null;
};

export const isLoggedIn = (): boolean => {
  return getCurrentUser() !== null;
};

export const getUserRole = (): UserRole | null => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

// Check if the user has a specific role
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};

// For demo purposes, automatically log in as a specific user type
export const autoLogin = (role: UserRole): User | null => {
  let email = '';
  
  switch (role) {
    case 'vendor':
      email = 'alex@restaurant.com';
      break;
    case 'delivery':
      email = 'john@delivery.com';
      break;
    case 'customer':
      email = 'emily@example.com';
      break;
  }
  
  return login(email, 'password');
};