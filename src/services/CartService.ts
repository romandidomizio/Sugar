// src/services/CartService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '../contexts/CartContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || (process.env.DEVICE_TYPE === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api');

class CartService {
  async getHeaders() {
    const token = await AsyncStorage.getItem('userToken');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  }

  async fetchCart() {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${API_URL}/cart`, headers);
      return this.transformCartData(response.data);
    } catch (error: any) {
      console.error('Error fetching cart:', error.response?.data || error.message);
      throw error;
    }
  }

  async addToCart(itemId: string, quantity: number = 1) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(`${API_URL}/cart/add`,
        { itemId, quantity },
        headers
      );
      return this.transformCartData(response.data);
    } catch (error: any) {
      console.error('Error adding item to cart:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateCartItemQuantity(itemId: string, quantity: number) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(`${API_URL}/cart/update`,
        { itemId, quantity },
        headers
      );
      return this.transformCartData(response.data);
    } catch (error: any) {
      console.error('Error updating cart quantity:', error.response?.data || error.message);
      throw error;
    }
  }

  async removeFromCart(itemId: string) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.delete(`${API_URL}/cart/remove/${itemId}`, headers);
      return this.transformCartData(response.data);
    } catch (error: any) {
      console.error('Error removing from cart:', error.response?.data || error.message);
      throw error;
    }
  }

  async clearCart() {
    try {
      const headers = await this.getHeaders();
      await axios.delete(`${API_URL}/cart/clear`, headers);
      return { items: [] };
    } catch (error: any) {
      console.error('Error clearing cart:', error.response?.data || error.message);
      throw error;
    }
  }

  async checkout(totalAmount: string) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(`${API_URL}/orders/checkout`,
        { totalAmount },
        headers
      );
      return response.data;
    } catch (error: any) {
      console.error('Error during checkout:', error.response?.data || error.message);
      throw error;
    }
  }

  async getOrderHistory() {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${API_URL}/orders/history`, headers);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order history:', error.response?.data || error.message);
      throw error;
    }
  }

  // Transform backend cart format to frontend format
  private transformCartData(cartData: any): { items: CartItem[] } {
    if (!cartData || !cartData.items) {
      return { items: [] };
    }

    const items = cartData.items.map((item: any) => ({
      id: item.foodItem._id,
      title: item.foodItem.title,
      producer: item.foodItem.producer,
      price: item.foodItem.price,
      description: item.foodItem.description,
      imageUri: item.foodItem.imageUri,
      quantity: item.quantity
    }));

    return { items };
  }
}

export default new CartService();
// claude v1
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { CartItem } from '../contexts/CartContext';
//
// const API_URL = process.env.EXPO_PUBLIC_API_URL || (process.env.DEVICE_TYPE === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api');
//
// class CartService {
//   async getCart() {
//     const token = await AsyncStorage.getItem('userToken');
//     if (!token) {
//       throw new Error('No authentication token');
//     }
//
//     try {
//       const response = await axios.get(`${API_URL}/cart`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//
//       // Transform the response to match CartItem format
//       const cartItems: CartItem[] = response.data.items.map((item: any) => ({
//         id: item.foodItemId._id,
//         title: item.foodItemId.title,
//         producer: item.foodItemId.producer,
//         price: item.foodItemId.price,
//         description: item.foodItemId.description,
//         imageUri: item.foodItemId.imageUri,
//         quantity: item.quantity
//       }));
//
//       return cartItems;
//     } catch (error: any) {
//       console.error('[CartService] Failed to fetch cart:', error);
//       throw error;
//     }
//   }
//
//   async addToCart(foodItemId: string, quantity: number = 1) {
//     const token = await AsyncStorage.getItem('userToken');
//     if (!token) {
//       throw new Error('No authentication token');
//     }
//
//     try {
//       const response = await axios.post(`${API_URL}/cart/items`,
//         { foodItemId, quantity },
//         { headers: { Authorization: `Bearer ${token}` }}
//       );
//       return response.data;
//     } catch (error: any) {
//       console.error('[CartService] Failed to add item to cart:', error);
//       throw error;
//     }
//   }
//
//   async updateQuantity(foodItemId: string, quantity: number) {
//     const token = await AsyncStorage.getItem('userToken');
//     if (!token) {
//       throw new Error('No authentication token');
//     }
//
//     try {
//       const response = await axios.put(`${API_URL}/cart/items/${foodItemId}`,
//         { quantity },
//         { headers: { Authorization: `Bearer ${token}` }}
//       );
//       return response.data;
//     } catch (error: any) {
//       console.error('[CartService] Failed to update item quantity:', error);
//       throw error;
//     }
//   }
//
//   async removeFromCart(foodItemId: string) {
//     const token = await AsyncStorage.getItem('userToken');
//     if (!token) {
//       throw new Error('No authentication token');
//     }
//
//     try {
//       const response = await axios.delete(`${API_URL}/cart/items/${foodItemId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       return response.data;
//     } catch (error: any) {
//       console.error('[CartService] Failed to remove item from cart:', error);
//       throw error;
//     }
//   }
//
//   async clearCart() {
//     const token = await AsyncStorage.getItem('userToken');
//     if (!token) {
//       throw new Error('No authentication token');
//     }
//
//     try {
//       const response = await axios.delete(`${API_URL}/cart`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       return response.data;
//     } catch (error: any) {
//       console.error('[CartService] Failed to clear cart:', error);
//       throw error;
//     }
//   }
//
//   async checkout() {
//     const token = await AsyncStorage.getItem('userToken');
//     if (!token) {
//       throw new Error('No authentication token');
//     }
//
//     try {
//       const response = await axios.post(`${API_URL}/cart/checkout`, {}, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       return response.data;
//     } catch (error: any) {
//       console.error('[CartService] Checkout failed:', error);
//       throw error;
//     }
//   }
//
//   async getOrderHistory() {
//     const token = await AsyncStorage.getItem('userToken');
//     if (!token) {
//       throw new Error('No authentication token');
//     }
//
//     try {
//       const response = await axios.get(`${API_URL}/cart/orders`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       return response.data;
//     } catch (error: any) {
//       console.error('[CartService] Failed to fetch order history:', error);
//       throw error;
//     }
//   }
// }
//
// export default new CartService();