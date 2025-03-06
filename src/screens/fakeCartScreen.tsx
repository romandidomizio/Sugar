import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';

const CartScreen: React.FC = () => {
  const route = useRoute();
  const { cartItems } = route.params || [];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Cart</Text>
      {cartItems && cartItems.length > 0 ? (
        cartItems.map((item, index) => (
          <View key={index} style={styles.cartItem}>
            <Text>{item.title}</Text>
            <Text>{item.price}</Text>
          </View>
        ))
      ) : (
        <Text>Your cart is empty</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  cartItem: {
    marginBottom: 15,
  },
});

export default CartScreen;

