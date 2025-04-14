// src/utils/axiosInstance.ts
import axios from 'axios';
import { API_BASE_URL } from '@env';
// Import secure storage mechanism if implemented (e.g., AsyncStorage)
// import AsyncStorage from '@react-native-async-storage/async-storage';
// Import a way to access the token (e.g., from context or a dedicated store)
// This is a placeholder; replace with your actual token retrieval logic
import { getToken } from './tokenStorage'; // Assuming a utility function/module exists

/**
 * Creates a configured Axios instance.
 * - Sets the base URL for all requests.
 * - Includes an interceptor to automatically add the JWT authorization header.
 * - Provides basic error handling for network issues or invalid tokens.
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json', // Default content type
  },
});

// Request interceptor to add the auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Retrieve the token (replace with your actual token retrieval method)
    const token = await getToken(); // Example: await AsyncStorage.getItem('authToken');

    if (token) {
      // Ensure headers object exists
      config.headers = config.headers || {};
      // Add the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Axios Interceptor: Token added to request headers.'); // Development log
    } else {
      console.log('Axios Interceptor: No token found.'); // Development log
    }
    return config;
  },
  (error) => {
    // Handle request error
    console.error('Axios Interceptor Request Error:', error); // Log request errors
    return Promise.reject(error);
  }
);

// Response interceptor (optional: for handling global errors like 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx causes this function to trigger
    // You can process successful responses here if needed
    return response;
  },
  (error) => {
    // Any status codes outside the range of 2xx cause this function to trigger
    console.error('Axios Interceptor Response Error:', error.response?.status, error.message); // Log response errors

    if (error.response?.status === 401) {
      // Handle unauthorized errors (e.g., redirect to login, refresh token)
      console.warn('Axios Interceptor: Received 401 Unauthorized. Token might be invalid or expired.');
      // Example: Trigger logout action
      // dispatch({ type: 'LOGOUT' }); // Assuming access to dispatch
    }

    // Return the error promise
    return Promise.reject(error);
  }
);

export default axiosInstance;
