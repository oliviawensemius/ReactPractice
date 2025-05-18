// src/services/auth.service.ts
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth'; // Adjust as needed

// Set up axios to include credentials
axios.defaults.withCredentials = true;

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
            const response = await axios.post(`${API_URL}/signup`, {
                name,
                email,
                password,
                role
            });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "An error occurred during signup"
            };
        }
    }


    // Sign in method
    async signin(email: string, password: string): Promise<AuthResponse> {
        try {
            console.log("Signing in with:", { email }); // Debug log
            const response = await axios.post(`${API_URL}/signin`, {
                email,
                password
            });

            console.log("Sign in response:", response.data); // Debug log

            // If login is successful, store user in localStorage
            if (response.data.success && response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('currentUserEmail', response.data.user.email);
            }

            return response.data;
        } catch (error: any) {
            console.error("Sign in error:", error.response?.data || error.message); // Debug log
            return {
                success: false,
                message: error.response?.data?.message || "Invalid email or password"
            };
        }
    }

    // Logout method
    // services/auth.service.ts (update the logout method)

    // Logout method
    async logout(): Promise<AuthResponse> {
        try {
            // Call API to logout
            const response = await axios.post(`${API_URL}/logout`, {}, {
                withCredentials: true // Important for cookies/session
            });

            // Clear local storage regardless of API response
            localStorage.removeItem('user');
            localStorage.removeItem('currentUserEmail');

            // Trigger storage event for cross-component communication
            window.dispatchEvent(new Event('storage'));

            return response.data;
        } catch (error: any) {
            console.error('Logout error:', error);

            // Still clear localStorage even if server request fails
            localStorage.removeItem('user');
            localStorage.removeItem('currentUserEmail');

            // Trigger storage event
            window.dispatchEvent(new Event('storage'));

            return {
                success: false,
                message: error.response?.data?.message || "Error occurred during logout"
            };
        }
    }

    // Get user profile
    async getProfile(): Promise<AuthResponse> {
        try {
            const response = await axios.get(`${API_URL}/profile`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || "Error fetching profile"
            };
        }
    }

    // Get current user from localStorage
    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (error) {
            return null;
        }
    }

    // Check if user is logged in
    isLoggedIn(): boolean {
        return this.getCurrentUser() !== null;
    }
}

export const authService = new AuthService();