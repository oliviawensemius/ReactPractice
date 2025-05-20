// frontend/services/auth.service.ts - Fixed to handle both localStorage and backend authentication

import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth';

// Set up axios with timeout and credentials
const authApi = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    withCredentials: true
});

// Add request interceptor for debugging
authApi.interceptors.request.use(
    (config) => {
        console.log('Auth Service - Making request to:', config.url);
        return config;
    },
    (error) => {
        console.error('Auth Service - Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
authApi.interceptors.response.use(
    (response) => {
        console.log('Auth Service - Response received:', response.status);
        return response;
    },
    (error) => {
        console.error('Auth Service - Response error:', error.message);
        return Promise.reject(error);
    }
);

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: User;
}

class AuthService {
    // Sign up method
    async signup(name: string, email: string, password: string, role: string): Promise<AuthResponse> {
        try {
            console.log('Auth Service - Signing up user:', { name, email, role });
            const response = await authApi.post('/signup', {
                name,
                email,
                password,
                role
            });
            return response.data;
        } catch (error: any) {
            console.error('Auth Service - Signup error:', error);
            return {
                success: false,
                message: error.response?.data?.message || "An error occurred during signup"
            };
        }
    }

    // Sign in method
    async signin(email: string, password: string): Promise<AuthResponse> {
        try {
            console.log('Auth Service - Signing in user:', { email });
            const response = await authApi.post('/signin', {
                email,
                password
            });

            console.log('Auth Service - Sign in response:', response.data);

            // If login is successful, store user in localStorage
            if (response.data.success && response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('currentUserEmail', response.data.user.email);
                localStorage.setItem('isAuthenticated', 'true');
                
                // Trigger storage event for cross-component communication
                window.dispatchEvent(new Event('storage'));
            }

            return response.data;
        } catch (error: any) {
            console.error('Auth Service - Sign in error:', error);
            return {
                success: false,
                message: error.response?.data?.message || "Invalid email or password"
            };
        }
    }

    // Logout method
    async logout(): Promise<AuthResponse> {
        try {
            console.log('Auth Service - Logging out user');
            
            // Call API to logout (if backend is available)
            try {
                await authApi.post('/logout');
            } catch (apiError) {
                console.warn('Auth Service - Backend logout failed, clearing local storage anyway');
            }

            // Always clear local storage
            this.clearLocalStorage();

            return {
                success: true,
                message: "Logged out successfully"
            };
        } catch (error: any) {
            console.error('Auth Service - Logout error:', error);
            
            // Still clear localStorage even if server request fails
            this.clearLocalStorage();

            return {
                success: false,
                message: error.response?.data?.message || "Error occurred during logout"
            };
        }
    }

    // Clear local storage and trigger events
    private clearLocalStorage(): void {
        localStorage.removeItem('user');
        localStorage.removeItem('currentUserEmail');
        localStorage.removeItem('isAuthenticated');
        
        // Trigger storage event for cross-component communication
        window.dispatchEvent(new Event('storage'));
    }

    // Get user profile from backend (with fallback to localStorage)
    async getProfile(): Promise<AuthResponse> {
        try {
            console.log('Auth Service - Getting user profile');
            
            // First check if user exists in localStorage
            const localUser = this.getCurrentUser();
            if (!localUser) {
                console.log('Auth Service - No user in localStorage, not authenticated');
                return {
                    success: false,
                    message: "Not authenticated"
                };
            }

            console.log('Auth Service - Found user in localStorage, attempting backend fetch');

            // Try to get fresh profile from backend
            try {
                const response = await authApi.get('/profile');
                
                if (response.data.success && response.data.user) {
                    console.log('Auth Service - Successfully got fresh profile from backend');
                    // Update localStorage with fresh data
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    return response.data;
                } else {
                    console.log('Auth Service - Backend returned unsuccessful response, using localStorage');
                    return {
                        success: true,
                        user: localUser,
                        message: "Profile loaded from local storage"
                    };
                }
            } catch (backendError: any) {
                console.log('Auth Service - Backend profile fetch failed:', backendError.message);
                
                // If backend is completely unavailable, use localStorage data
                if (backendError.code === 'ECONNREFUSED' || backendError.message?.includes('Network Error')) {
                    console.log('Auth Service - Backend not available, using localStorage');
                    return {
                        success: true,
                        user: localUser,
                        message: "Profile loaded from local storage (backend unavailable)"
                    };
                }
                
                // For other backend errors (like 401), the session might be invalid
                if (backendError.response?.status === 401) {
                    console.log('Auth Service - Session invalid, clearing localStorage');
                    this.clearLocalStorage();
                    return {
                        success: false,
                        message: "Session expired, please sign in again"
                    };
                }
                
                // For any other error, use localStorage as fallback
                console.log('Auth Service - Using localStorage as fallback for backend error');
                return {
                    success: true,
                    user: localUser,
                    message: "Profile loaded from local storage"
                };
            }
        } catch (error: any) {
            console.error('Auth Service - Unexpected error in getProfile:', error);
            return {
                success: false,
                message: "Error retrieving user profile"
            };
        }
    }

    // Get current user from localStorage
    getCurrentUser(): User | null {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                console.log('Auth Service - No user in localStorage');
                return null;
            }
            
            const user = JSON.parse(userStr);
            console.log('Auth Service - Found user in localStorage:', user.email);
            return user;
        } catch (error) {
            console.error('Auth Service - Error parsing user from localStorage:', error);
            return null;
        }
    }

    // Check if user is logged in
    isLoggedIn(): boolean {
        const user = this.getCurrentUser();
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        console.log('Auth Service - Checking login status:', {
            hasUser: !!user,
            isAuthenticated,
            overall: !!(user && isAuthenticated)
        });
        
        return !!(user && isAuthenticated);
    }

    // Validate session with backend (optional)
    async validateSession(): Promise<boolean> {
        try {
            const response = await authApi.get('/profile');
            return response.data.success;
        } catch (error) {
            console.warn('Auth Service - Session validation failed:', error);
            return false;
        }
    }

    // Test backend connection
    async testConnection(): Promise<boolean> {
        try {
            await authApi.get('/profile');
            return true;
        } catch (error) {
            console.warn('Auth Service - Backend not available');
            return false;
        }
    }
}

export const authService = new AuthService();