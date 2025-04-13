// src/contexts/CartContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import CartService from '../services/CartService';
import { useAppContext } from './AppContext';

// Define the item interface
export interface CartItem {
  id: string;
  title: string;
  producer: string;
  price: string;
  description: string;
  imageUri: string;
  quantity: number;
}

// Define the context interface
interface CartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => string;
  checkout: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

// Create the context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  loading: false,
  error: null,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  getTotal: () => '$0.00',
  checkout: async () => false,
  refreshCart: async () => {},
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { state } = useAppContext();
  const { isAuthenticated } = state.auth;

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      // Clear local cart if user is not authenticated
      setItems([]);
    }
  }, [isAuthenticated]);

  const refreshCart = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const { items: cartItems } = await CartService.fetchCart();
      setItems(cartItems);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cart');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    if (!isAuthenticated) {
      setError('Please log in to add items to cart');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { items: updatedItems } = await CartService.addToCart(item.id);
      setItems(updatedItems);
    } catch (err: any) {
      setError(err.message || 'Failed to add item to cart');
      console.error('Error adding to cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const { items: updatedItems } = await CartService.removeFromCart(itemId);
      setItems(updatedItems);
    } catch (err: any) {
      setError(err.message || 'Failed to remove item from cart');
      console.error('Error removing from cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!isAuthenticated) return;

    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    setLoading(true);
    setError(null);

    try {
      const { items: updatedItems } = await CartService.updateCartItemQuantity(itemId, quantity);
      setItems(updatedItems);
    } catch (err: any) {
      setError(err.message || 'Failed to update quantity');
      console.error('Error updating quantity:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      await CartService.clearCart();
      setItems([]);
    } catch (err: any) {
      setError(err.message || 'Failed to clear cart');
      console.error('Error clearing cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    const total = items.reduce((acc, item) => {
      // Extract the numeric part of the price (remove $ and any /lb or similar)
      const priceMatch = item.price.match(/\$([0-9.]+)/);
      if (!priceMatch) return acc;

      const priceValue = parseFloat(priceMatch[1]);
      return acc + priceValue * item.quantity;
    }, 0);

    return `$${total.toFixed(2)}`;
  };

  const checkout = async () => {
    if (!isAuthenticated) {
      setError('Please log in to checkout');
      return false;
    }

    if (items.length === 0) {
      setError('Cart is empty');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const totalAmount = getTotal();
      await CartService.checkout(totalAmount);
      setItems([]);
      return true;
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
      console.error('Error during checkout:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    items,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    checkout,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
// claude v1
// import React, { createContext, useState, useContext, useEffect } from 'react';
// import CartService from '../services/CartService';
// import { useAppContext } from './AppContext';
//
// // Define the item interface
// export interface CartItem {
//   id: string;
//   title: string;
//   producer: string;
//   price: string;
//   description: string;
//   imageUri: string;
//   quantity: number;
// }
//
// // Define the context interface
// interface CartContextType {
//   items: CartItem[];
//   isLoading: boolean;
//   error: string | null;
//   addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
//   removeFromCart: (itemId: string) => Promise<void>;
//   updateQuantity: (itemId: string, quantity: number) => Promise<void>;
//   clearCart: () => Promise<void>;
//   checkout: () => Promise<void>;
//   getTotal: () => string;
//   refreshCart: () => Promise<void>;
// }
//
// // Create the context with default values
// const CartContext = createContext<CartContextType>({
//   items: [],
//   isLoading: false,
//   error: null,
//   addToCart: async () => {},
//   removeFromCart: async () => {},
//   updateQuantity: async () => {},
//   clearCart: async () => {},
//   checkout: async () => {},
//   getTotal: () => '$0.00',
//   refreshCart: async () => {},
// });
//
// // Custom hook to use the cart context
// export const useCart = () => useContext(CartContext);
//
// // Provider component
// export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [items, setItems] = useState<CartItem[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//
//   const { state } = useAppContext();
//   const { isAuthenticated } = state.auth;
//
//   // Load cart items when authenticated
//   useEffect(() => {
//     if (isAuthenticated) {
//       refreshCart();
//     } else {
//       // Clear local cart when user logs out
//       setItems([]);
//     }
//   }, [isAuthenticated]);
//
//   const refreshCart = async () => {
//     if (!isAuthenticated) return;
//
//     setIsLoading(true);
//     setError(null);
//
//     try {
//       const cartItems = await CartService.getCart();
//       setItems(cartItems);
//     } catch (err: any) {
//       setError(err.message || 'Failed to fetch cart');
//       console.error('Error fetching cart:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
//     try {
//       setIsLoading(true);
//       setError(null);
//
//       if (isAuthenticated) {
//         await CartService.addToCart(item.id);
//         await refreshCart();
//       } else {
//         // If not authenticated, just update local state
//         setItems((prevItems) => {
//           const existingItemIndex = prevItems.findIndex((i) => i.id === item.id);
//
//           if (existingItemIndex !== -1) {
//             const updatedItems = [...prevItems];
//             updatedItems[existingItemIndex].quantity += 1;
//             return updatedItems;
//           } else {
//             return [...prevItems, { ...item, quantity: 1 }];
//           }
//         });
//       }
//     } catch (err: any) {
//       setError(err.message || 'Failed to add item to cart');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const removeFromCart = async (itemId: string) => {
//     try {
//       setIsLoading(true);
//       setError(null);
//
//       if (isAuthenticated) {
//         await CartService.removeFromCart(itemId);
//         await refreshCart();
//       } else {
//         setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
//       }
//     } catch (err: any) {
//       setError(err.message || 'Failed to remove item from cart');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const updateQuantity = async (itemId: string, quantity: number) => {
//     if (quantity <= 0) {
//       await removeFromCart(itemId);
//       return;
//     }
//
//     try {
//       setIsLoading(true);
//       setError(null);
//
//       if (isAuthenticated) {
//         await CartService.updateQuantity(itemId, quantity);
//         await refreshCart();
//       } else {
//         setItems((prevItems) =>
//           prevItems.map((item) =>
//             item.id === itemId ? { ...item, quantity } : item
//           )
//         );
//       }
//     } catch (err: any) {
//       setError(err.message || 'Failed to update item quantity');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const clearCart = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
//
//       if (isAuthenticated) {
//         await CartService.clearCart();
//       }
//
//       setItems([]);
//     } catch (err: any) {
//       setError(err.message || 'Failed to clear cart');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const checkout = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
//
//       if (isAuthenticated) {
//         await CartService.checkout();
//         setItems([]);
//       } else {
//         throw new Error('User must be logged in to checkout');
//       }
//     } catch (err: any) {
//       setError(err.message || 'Checkout failed');
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const getTotal = () => {
//     const total = items.reduce((acc, item) => {
//       // Extract the numeric part of the price (remove $ and any /lb or similar)
//       const priceMatch = item.price.match(/\$([0-9.]+)/);
//       if (!priceMatch) return acc;
//
//       const priceValue = parseFloat(priceMatch[1]);
//       return acc + priceValue * item.quantity;
//     }, 0);
//
//     return `$${total.toFixed(2)}`;
//   };
//
//   const value = {
//     items,
//     isLoading,
//     error,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     clearCart,
//     checkout,
//     getTotal,
//     refreshCart,
//   };
//
//   return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
// };

// import React, { createContext, useState, useContext } from 'react';
//
// // Define the item interface
// export interface CartItem {
//   id: string;
//   title: string;
//   producer: string;
//   price: string;
//   description: string;
//   imageUri: string;
//   quantity: number;
// }
//
// // Define the context interface
// interface CartContextType {
//   items: CartItem[];
//   addToCart: (item: Omit<CartItem, 'quantity'>) => void;
//   removeFromCart: (itemId: string) => void;
//   updateQuantity: (itemId: string, quantity: number) => void;
//   clearCart: () => void;
//   getTotal: () => string;
// }
//
// // Create the context with default values
// const CartContext = createContext<CartContextType>({
//   items: [],
//   addToCart: () => {},
//   removeFromCart: () => {},
//   updateQuantity: () => {},
//   clearCart: () => {},
//   getTotal: () => '$0.00',
// });
//
// // Custom hook to use the cart context
// export const useCart = () => useContext(CartContext);
//
// // Provider component
// export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [items, setItems] = useState<CartItem[]>([]);
//
//   const addToCart = (item: Omit<CartItem, 'quantity'>) => {
//     setItems((prevItems) => {
//       // Check if item already exists in cart
//       const existingItemIndex = prevItems.findIndex((i) => i.id === item.id);
//
//       if (existingItemIndex !== -1) {
//         // If item exists, increase quantity
//         const updatedItems = [...prevItems];
//         updatedItems[existingItemIndex].quantity += 1;
//         return updatedItems;
//       } else {
//         // If item doesn't exist, add it with quantity 1
//         return [...prevItems, { ...item, quantity: 1 }];
//       }
//     });
//   };
//
//   const removeFromCart = (itemId: string) => {
//     setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
//   };
//
//   const updateQuantity = (itemId: string, quantity: number) => {
//     if (quantity <= 0) {
//       // If quantity is 0 or less, remove the item
//       removeFromCart(itemId);
//       return;
//     }
//
//     setItems((prevItems) =>
//       prevItems.map((item) =>
//         item.id === itemId ? { ...item, quantity } : item
//       )
//     );
//   };
//
//   const clearCart = () => {
//     setItems([]);
//   };
//
//   const getTotal = () => {
//     const total = items.reduce((acc, item) => {
//       // Extract the numeric part of the price (remove $ and any /lb or similar)
//       const priceMatch = item.price.match(/\$([0-9.]+)/);
//       if (!priceMatch) return acc;
//
//       const priceValue = parseFloat(priceMatch[1]);
//       return acc + priceValue * item.quantity;
//     }, 0);
//
//     return `$${total.toFixed(2)}`;
//   };
//
//   const value = {
//     items,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     clearCart,
//     getTotal,
//   };
//
//   return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
// };