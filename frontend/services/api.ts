// frontend/services/api.ts - ULTIMATE FIX
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // CRITICAL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    config.withCredentials = true; // Ensure it's always true
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });

    if (error.response?.status === 401) {
      console.error('🔐 Authentication Error - clearing storage');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser');
        // Don't auto-redirect, let components handle it
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Test functions
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const testCreateSession = async () => {
  try {
    const response = await api.post('/debug/create-session');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const debugSession = async () => {
  try {
    const response = await api.get('/debug/session');
    return response.data;
  } catch (error: any) {
    return { error: error.message };
  }
};