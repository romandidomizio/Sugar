import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../contexts/types';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';


const API_URL = process.env.EXPO_PUBLIC_API_URL || (process.env.DEVICE_TYPE === 'android' ? 'http://10.0.2.2:3000/api/users' : 'http://localhost:3000/api/users');

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name?: string;
  email?: string;
  phone?: string;
}

class AuthService {
    async uploadProfilePhoto(photoUri: string) {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        console.error('[AuthService] No authentication token for photo upload');
        throw new Error('No authentication token');
      }

      // Create form data
      const formData = new FormData();

      // Get the file name from the URI
      const uriParts = photoUri.split('/');
      const fileName = uriParts[uriParts.length - 1];

      // Append the image to form data
      formData.append('photo', {
        uri: photoUri,
        name: fileName,
        type: 'image/jpeg',
      } as any);

      console.log('[AuthService] Uploading photo:', photoUri);

      try {
        const response = await fetch(`${API_URL}/upload-photo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type header, let fetch set it automatically
          },
          body: formData
        });

        const responseData = await response.json();
        console.log('[AuthService] Photo upload response:', responseData);

        if (!response.ok) {
          throw new Error(responseData.message || 'Upload failed');
        }

        return responseData;
      } catch (error: any) {
        console.error('[AuthService] Upload error:', error);
        throw error;
      }
    }
//     async uploadProfilePhoto(photoUri: string) {
//       const token = await AsyncStorage.getItem('userToken');
//
//       if (!token) {
//         console.error('[AuthService] No authentication token for photo upload');
//         throw new Error('No authentication token');
//       }
//
//       // Create form data
//       const formData = new FormData();
//
//       // Get the file name from the URI
//       const uriParts = photoUri.split('/');
//       const fileName = uriParts[uriParts.length - 1];
//
//       // Append the image to form data
//       formData.append('photo', {
//         uri: photoUri,
//         name: fileName,
//         type: 'image/jpeg', // You might want to detect this dynamically
//       } as any);
//
//       try {
//         const response = await axios.post(`${API_URL}/upload-photo`, formData, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'multipart/form-data',
//           }
//         });
//         console.log('[AuthService] Photo uploaded successfully');
//         return response.data;
//       } catch (error: any) {
//         const errorMessage = error.response?.data?.message || 'Photo upload failed';
//         console.error(`[AuthService] Photo upload failed: ${errorMessage}`);
//         throw errorMessage;
//       }
//     }

  async login(credentials: LoginCredentials) {
    try {
      console.log(`[AuthService] Attempting login for user: ${credentials.username}`);
      const response = await axios.post(`${API_URL}/login`, credentials);
      const { token } = response.data;
      
      // Store token in secure storage
      await AsyncStorage.setItem('userToken', token);
      
      console.log(`[AuthService] Login successful for user: ${credentials.username}`);
      
      // Fetch user profile
      const profileResponse = await this.fetchUserProfile(token);
      
      return {
        user: profileResponse,
        token
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      console.error(`[AuthService] Login failed: ${errorMessage}`);
      throw errorMessage;
    }
  }

  async register(credentials: RegisterCredentials) {
    try {
      console.log(`[AuthService] Attempting registration for user: ${credentials.username}`);
      const response = await axios.post(`${API_URL}/register`, credentials);
      console.log(`[AuthService] Registration successful for user: ${credentials.username}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      console.error(`[AuthService] Registration failed: ${errorMessage}`);
      throw errorMessage;
    }
  }

  async fetchUserProfile(token?: string) {
    if (!token) {
      token = await AsyncStorage.getItem('userToken') || undefined;
    }

    if (!token) {
      console.error('[AuthService] No authentication token found');
      throw new Error('No authentication token');
    }

    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
      console.error(`[AuthService] Profile fetch failed: ${errorMessage}`);
      throw errorMessage;
    }
  }

  async logout() {
    try {
      // Remove token from storage
      await AsyncStorage.removeItem('userToken');
      console.log('[AuthService] Logout successful');
    } catch (error) {
      console.error('[AuthService] Logout failed', error);
      throw error;
    }
  }

  async updateProfile(profileData: Partial<User>) {
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      console.error('[AuthService] No authentication token for profile update');
      throw new Error('No authentication token');
    }

    try {
      const response = await axios.put(`${API_URL}/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[AuthService] Profile updated successfully');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      console.error(`[AuthService] Profile update failed: ${errorMessage}`);
      throw errorMessage;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  }

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('userToken');
  }
}

export default new AuthService();
