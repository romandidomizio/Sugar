import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  title: string;
  producer: string;
  price: string;
  description?: string;
  imageUri?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: any) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => string;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getTotal: () => '$0.00',
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart items from AsyncStorage on mount
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        const storedItems = await AsyncStorage.getItem('cartItems');
        if (storedItems) {
          setItems(JSON.parse(storedItems));
        }
      } catch (error) {
        console.error('Error loading cart items:', error);
      }
    };

    loadCartItems();
  }, []);

  // Save cart items to AsyncStorage whenever they change
  useEffect(() => {
    const saveCartItems = async () => {
      try {
        await AsyncStorage.setItem('cartItems', JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart items:', error);
      }
    };

    saveCartItems();
  }, [items]);

  const addToCart = (item: any) => {
    setItems((prevItems) => {
      // Check if the item is already in the cart
      const existingItemIndex = prevItems.findIndex((i) => i.id === item._id || i.id === item.id);

      if (existingItemIndex !== -1) {
        // If item exists, increase quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        // Add new item to cart with a quantity of 1
        const itemId = item._id || item.id;
        return [
          ...prevItems,
          {
            id: itemId,
            title: item.title,
            producer: item.producer,
            price: item.price,
            description: item.description,
            imageUri: item.imageUri,
            quantity: 1,
          },
        ];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      // If quantity is reduced to 0 or below, remove the item
      removeFromCart(itemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    const total = items.reduce((sum, item) => {
      // Extract numeric value from price string (remove '$' and any other non-numeric characters)
      const priceValue = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return sum + priceValue * item.quantity;
    }, 0);

    return `$${total.toFixed(2)}`;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

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