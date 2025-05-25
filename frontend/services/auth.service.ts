// frontend/services/auth.service.ts
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

  // Initialize auth service
  async initialize() {
    try {
      const response = await this.checkAuthStatus();
      if (response.success && response.user) {
        this.currentUser = response.user;
        // Update localStorage for backward compatibility
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('currentUserEmail', response.user.email);
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
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('currentUserEmail', data.user.email);
        
        // Trigger storage event for components listening
        window.dispatchEvent(new Event('storage'));
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
      window.dispatchEvent(new Event('storage'));

      return data;
    } catch (error) {
      console.error('Logout error:', error);
      
      // Force logout on client side even if server request fails
      this.currentUser = null;
      this.clearLocalStorage();
      window.dispatchEvent(new Event('storage'));
      
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
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('currentUserEmail', data.user.email);
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

    // Fallback to localStorage for backward compatibility
    try {
      const userStr = localStorage.getItem('user');
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
    localStorage.removeItem('user');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('isAuthenticated');
  }
}

export const authService = new AuthService();

// Initialize on import (for browser environment)
if (typeof window !== 'undefined') {
  authService.initialize();
}