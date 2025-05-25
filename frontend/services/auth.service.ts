// frontend/services/auth.service.ts - Fixed for SSR compatibility
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roleSpecificId?: string;
  createdAt?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

class AuthService {
  private currentUser: User | null = null;

  // Check if we're in browser environment
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Safe localStorage access
  private getFromStorage(key: string): string | null {
    if (!this.isBrowser()) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  }

  private setInStorage(key: string, value: string): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  }

  private removeFromStorage(key: string): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  // Initialize auth service
  async initialize() {
    if (!this.isBrowser()) return;
    
    try {
      const response = await this.checkAuthStatus();
      if (response.success && response.user) {
        this.currentUser = response.user;
        // Update localStorage for backward compatibility
        this.setInStorage('user', JSON.stringify(response.user));
        this.setInStorage('currentUserEmail', response.user.email);
      } else {
        // Clear localStorage if not authenticated
        this.clearLocalStorage();
      }
    } catch (error) {
      console.log('Auth initialization failed - user not logged in');
      this.clearLocalStorage();
    }
  }

  // Sign up
  async signup(name: string, email: string, password: string, role: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          password,
          role
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  // Sign in
  async signin(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        this.currentUser = data.user;
        // Update localStorage for backward compatibility
        this.setInStorage('user', JSON.stringify(data.user));
        this.setInStorage('currentUserEmail', data.user.email);
        
        // Trigger storage event for components listening
        if (this.isBrowser()) {
          window.dispatchEvent(new Event('storage'));
        }
      }

      return data;
    } catch (error) {
      console.error('Signin error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  // Logout
  async logout(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      // Clear local state regardless of response
      this.currentUser = null;
      this.clearLocalStorage();
      
      // Trigger storage event for components listening
      if (this.isBrowser()) {
        window.dispatchEvent(new Event('storage'));
      }

      return data;
    } catch (error) {
      console.error('Logout error:', error);
      
      // Force logout on client side even if server request fails
      this.currentUser = null;
      this.clearLocalStorage();
      if (this.isBrowser()) {
        window.dispatchEvent(new Event('storage'));
      }
      
      return {
        success: true,
        message: 'Logged out (client-side)'
      };
    }
  }

  // Get current user profile from server
  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.user) {
        this.currentUser = data.user;
        // Update localStorage
        this.setInStorage('user', JSON.stringify(data.user));
        this.setInStorage('currentUserEmail', data.user.email);
      }

      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return {
        success: false,
        message: 'Failed to fetch profile'
      };
    }
  }

  // Check authentication status
  async checkAuthStatus(): Promise<{ success: boolean; authenticated: boolean; user?: User }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Auth check error:', error);
      return {
        success: false,
        authenticated: false
      };
    }
  }

  // Get current user (from local cache)
  getCurrentUser(): User | null {
    // Try from memory first
    if (this.currentUser) {
      return this.currentUser;
    }

    // Fallback to localStorage for backward compatibility (browser only)
    if (!this.isBrowser()) return null;
    
    try {
      const userStr = this.getFromStorage('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.currentUser = user;
        return user;
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }

    return null;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Get user role
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  // Clear localStorage
  private clearLocalStorage() {
    this.removeFromStorage('user');
    this.removeFromStorage('currentUserEmail');
    this.removeFromStorage('isAuthenticated');
  }
}

export const authService = new AuthService();

// Initialize on import (for browser environment only)
if (typeof window !== 'undefined') {
  authService.initialize();
}