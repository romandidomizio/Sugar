import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme, Text, Divider, Surface, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

import { PaperButton } from '../components/paper';
import { useAuth } from '../contexts/AppContext'; // Assuming you have an auth context

interface OrderItem {
  itemId: string;
  title: string;
  producer: string;
  price: string;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
}

const OrderHistoryScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');

      const response = await axios.get('http://localhost:3000/api/orders/user', {
        headers: { 'x-auth-token': token }
      });

      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'processing':
        return theme.colors.primary;
      case 'shipped':
        return theme.colors.info;
      case 'delivered':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.onSurface;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    return (
      <Surface style={[styles.orderItem, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.orderHeader}>
          <Text variant="titleMedium" style={styles.orderId}>
            Order #{item._id.substring(item._id.length - 8)}
          </Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
            textStyle={{ color: getStatusColor(item.status) }}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Chip>
        </View>

        <Text variant="bodyMedium" style={styles.dateText}>
          Placed on {formatDate(item.orderDate)}
        </Text>

        <Divider style={styles.divider} />

        <Text variant="bodyMedium" style={styles.itemCount}>
          {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
        </Text>

        {item.items.slice(0, 2).map((orderItem, index) => (
          <View key={index} style={styles.itemRow}>
            <Text variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>
              {orderItem.quantity}x {orderItem.title}
            </Text>
            <Text variant="bodyMedium">
              ${(parseFloat(orderItem.price.replace('$', '')) * orderItem.quantity).toFixed(2)}
            </Text>
          </View>
        ))}

        {item.items.length > 2 && (
          <Text variant="bodySmall" style={styles.moreItems}>
            +{item.items.length - 2} more items
          </Text>
        )}

        <Divider style={styles.divider} />

        <View style={styles.totalRow}>
          <Text variant="titleSmall">Total</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
            {item.totalAmount}
          </Text>
        </View>

        <PaperButton
          variant="tertiary"
          size="small"
          onPress={() => navigation.navigate('OrderDetails', { orderId: item._id })}
          style={styles.viewButton}
        >
          View Details
        </PaperButton>
      </Surface>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Order History
        </Text>
      </View>

      <Divider />

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
            No Orders Yet
          </Text>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Your order history will appear here when you make purchases.
          </Text>
          <PaperButton
            variant="primary"
            onPress={() => navigation.navigate('Home')}
            style={styles.shopButton}
          >
            Start Shopping
          </PaperButton>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    padding: 20,
  },
  title: {
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
  orderItem: {
    padding: 16,
    borderRadius: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
  },
  dateText: {
    marginBottom: 12,
    opacity: 0.7,
  },
  divider: {
    marginVertical: 12,
  },
  itemCount: {
    marginBottom: 8,
    fontWeight: '500',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  moreItems: {
    marginTop: 4,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewButton: {
    alignSelf: 'flex-end',
  },
  separator: {
    height: 16,
  },
});

export default OrderHistoryScreen;