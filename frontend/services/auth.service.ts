// frontend/services/auth.service.ts
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roleSpecificId?: string;
  created_at: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

interface AuthCheckResponse {
  success: boolean;
  authenticated: boolean;
  user?: User;
}

class AuthService {
  private currentUser: User | null = null;

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

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

  async initialize() {
    if (!this.isBrowser()) return;
    
    try {
      const response = await this.checkAuthStatus();
      if (response.success && response.user) {
        this.currentUser = response.user;
        this.setInStorage('user', JSON.stringify(response.user));
        this.setInStorage('currentUserEmail', response.user.email);
      } else {
        this.clearLocalStorage();
      }
    } catch (error) {
      console.log('Auth initialization failed - user not logged in');
      this.clearLocalStorage();
    }
  }

  async signup(name: string, email: string, password: string, role: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/signup', {
        name, email, password, role
      });
      return response.data as AuthResponse;
    } catch (error: any) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error. Please try again.'
      };
    }
  }

  async signin(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/signin', { email, password });
      const data = response.data as AuthResponse;

      if (data.success && data.user) {
        this.currentUser = data.user;
        this.setInStorage('user', JSON.stringify(data.user));
        this.setInStorage('currentUserEmail', data.user.email);
        
        if (this.isBrowser()) {
          window.dispatchEvent(new Event('storage'));
        }
      }

      return data;
    } catch (error: any) {
      console.error('Signin error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error. Please try again.'
      };
    }
  }

  async logout(): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/logout');
      const data = response.data as AuthResponse;

      this.currentUser = null;
      this.clearLocalStorage();
      
      if (this.isBrowser()) {
        window.dispatchEvent(new Event('storage'));
      }

      return data;
    } catch (error: any) {
      console.error('Logout error:', error);
      
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

  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await api.get('/auth/profile');
      const data = response.data as AuthResponse;

      if (data.success && data.user) {
        this.currentUser = data.user;
        this.setInStorage('user', JSON.stringify(data.user));
        this.setInStorage('currentUserEmail', data.user.email);
      }

      return data;
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile'
      };
    }
  }

  async checkAuthStatus(): Promise<AuthCheckResponse> {
    try {
      const response = await api.get('/auth/check');
      return response.data as AuthCheckResponse;
    } catch (error: any) {
      console.error('Auth check error:', error);
      return {
        success: false,
        authenticated: false
      };
    }
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }

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

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  private clearLocalStorage() {
    this.removeFromStorage('user');
    this.removeFromStorage('currentUserEmail');
    this.removeFromStorage('isAuthenticated');
  }
}

export const authService = new AuthService();

if (typeof window !== 'undefined') {
  authService.initialize();
}