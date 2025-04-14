import React, { createContext, useState, useContext, useMemo } from 'react';

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
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

// Create the context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  total: 0,
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex((i) => i.id === item.id);

      if (existingItemIndex !== -1) {
        // If item exists, increase quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        // If item doesn't exist, add it with quantity 1
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item
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

  // Calculate total using useMemo, dependent on items
  const total = useMemo(() => {
    return items.reduce((acc, item) => {
      // Ensure price is treated as a string for regex matching
      const priceString = String(item.price);
      const priceMatch = priceString.match(/\$?([0-9.]+)/); // Allow optional $ prefix

      if (!priceMatch) {
        console.warn(`Could not parse price for item ${item.title}: ${item.price}`);
        return acc;
      }

      const priceValue = parseFloat(priceMatch[1]);

      // Ensure priceValue is a valid number
      if (isNaN(priceValue)) {
        console.warn(`Parsed price is NaN for item ${item.title}: ${item.price}`);
        return acc;
      }

      return acc + priceValue * item.quantity;
    }, 0); // Initial accumulator value is 0
  }, [items]); // Dependency array ensures recalculation only when items change

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total, // Pass the calculated total value
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};