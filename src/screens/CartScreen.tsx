/* CartScreen.tsx */
import React from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { useTheme, Text, Divider, IconButton, Surface } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import { useCart, CartItem } from '../contexts/CartContext';

import { PaperButton } from '../components/paper';

type CartScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Cart'>;
};

const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
        No favorited items yet
      </Text>
      <Text variant="bodyLarge" style={styles.emptyText}>
        Add items from the marketplace to start shopping!
      </Text>
      <PaperButton
        variant="primary"
        // Navigate to the BottomTab navigator, targeting the Home screen within it
        // Lint f1f18aaa may persist due to navigation type definitions
        onPress={() => navigation.navigate('BottomTab', { screen: 'Home' })}
        style={styles.shopButton}
      >
        Go to Marketplace
      </PaperButton>
    </View>
  );

  const handleCheckout = () => {
    Alert.alert(
      'Checkout',
      'This would normally proceed to checkout. Feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearCart() }
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    return (
      <Surface style={[styles.cartItem, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.itemInfo}>
          <Text variant="titleMedium" style={styles.itemTitle}>
            {item.title}
          </Text>
          <Text variant="bodyMedium">Producer: {item.producer}</Text>
          <Text variant="bodyMedium">Price: {item.price}</Text>
        </View>

        <View style={styles.quantityContainer}>
          <IconButton
            icon="minus"
            size={20}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          />
          <Text variant="bodyLarge" style={styles.quantityText}>
            {item.quantity}
          </Text>
          <IconButton
            icon="plus"
            size={20}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          />
        </View>

        <IconButton
          icon="delete"
          size={24}
          onPress={() => removeFromCart(item.id)}
          style={styles.deleteButton}
        />
      </Surface>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <Text
          variant="headlineLarge"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Your Favorites
        </Text>
      </View>

      <Divider />

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          <View style={[styles.summaryContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.summaryRow}>
              <Text variant="titleMedium">Total:</Text>
              <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                {`$${total.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              {/* --- Modified Clear Cart Button --- */}
              <PaperButton
                variant="tertiary"
                size="small"
                onPress={() => {}} // Optional: Set to no-op, disabled is key
                disabled={true}    // Disable interaction
                style={{ opacity: 0 }} // Make invisible
              >
                Clear Cart
              </PaperButton>
              {/* --- Modified Checkout Button --- */}
              <PaperButton
                variant="primary"
                onPress={() => {}} // Optional: Set to no-op, disabled is key
                disabled={true}    // Disable interaction
                style={{ opacity: 0 }} // Make invisible
              >
                Checkout
              </PaperButton>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    flex: 1,
    textAlign: 'left',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
  },
  shopButton: {
    marginTop: 20,
  },
  listContainer: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  quantityText: {
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginLeft: 8,
  },
  separator: {
    height: 12,
  },
  summaryContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default CartScreen;