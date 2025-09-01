/**
 * API Service
 * ===========
 * Handles all API communications and data fetching
 * Migrated from vanilla JS api.js
 */

import axios from 'axios';

// API Configuration
const API_BASE_URL = 'https://api.simplego.co';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      sessionStorage.clear();
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired'));
    }
    return Promise.reject(error);
  }
);

/**
 * Login function
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response with token and user info
 */
export async function login(email, password) {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });

    if (response.data.success) {
      const { token, user } = response.data;
      
      // Store authentication data
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userDisplayName', user.name || user.email || 'Usuario');
      
      return {
        success: true,
        user,
        token
      };
    } else {
      throw new Error(response.data.message || 'Error en el login');
    }
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Credenciales incorrectas');
    } else if (error.response?.status >= 500) {
      throw new Error('Error del servidor. Intenta de nuevo más tarde.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Tiempo de espera agotado. Verifica tu conexión.');
    } else {
      throw new Error(error.message || 'Error de conexión');
    }
  }
}

/**
 * Fetch CSV data from API
 * @returns {Promise<string>} CSV data as string
 */
export async function fetchCsvData() {
  try {
    console.log('Fetching CSV data from API...');
    
    const response = await apiClient.get('/data/transactions.csv', {
      responseType: 'text' // Important for CSV data
    });
    
    if (typeof response.data === 'string' && response.data.length > 0) {
      console.log('✅ CSV data fetched successfully, size:', response.data.length, 'characters');
      return response.data;
    } else {
      throw new Error('Datos CSV vacíos o inválidos');
    }
  } catch (error) {
    console.error('Error fetching CSV data:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Session expired');
    } else if (error.response?.status === 404) {
      throw new Error('Datos no encontrados');
    } else if (error.response?.status >= 500) {
      throw new Error('Error del servidor al obtener los datos');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Tiempo de espera agotado al cargar los datos');
    } else {
      throw new Error(error.message || 'Error al cargar los datos');
    }
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export function checkAuthentication() {
  const token = sessionStorage.getItem('authToken');
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  
  return !!(token && isLoggedIn);
}

/**
 * Logout function
 * Clears all session data and redirects to login
 */
export function logout() {
  sessionStorage.clear();
  window.location.href = '/login';
}

/**
 * Get user display name from session
 * @returns {string} User display name
 */
export function getUserDisplayName() {
  return sessionStorage.getItem('userDisplayName') || 'Usuario';
}

export default {
  login,
  fetchCsvData,
  checkAuthentication,
  logout,
  getUserDisplayName
};
