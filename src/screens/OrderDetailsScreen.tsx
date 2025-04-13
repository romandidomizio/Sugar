import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme, Text, Divider, Surface, Chip, IconButton } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PaperButton } from '../components/paper';

interface OrderItem {
  itemId: string;
  title: string;
  producer: string;
  price: string;
  quantity: number;
}

interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingDetails: ShippingDetails;
  paymentMethod: string;
  totalAmount: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
}

const OrderDetailsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params as { orderId: string };

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('authToken');

        const response = await axios.get(`http://localhost:3000/api/orders/${orderId}`, {
          headers: { 'x-auth-token': token }
        });

        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const translatePaymentMethod = (method: string) => {
    switch (method) {
      case 'creditCard':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  const handleCancelOrder = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await axios.patch(
        `http://localhost:3000/api/orders/${orderId}/status`,
        { status: 'cancelled' },
        { headers: { 'x-auth-token': token } }
      );

      // Update the local order state
      setOrder(response.data);
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleLarge">Order not found</Text>
        <PaperButton
          variant="tertiary"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Go Back
        </PaperButton>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Order Details
        </Text>
      </View>

      <Divider />

      {/* Order Status Section */}
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.orderHeader}>
          <Text variant="titleMedium" style={styles.orderId}>
            Order #{order._id.substring(order._id.length - 8)}
          </Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) + '20' }]}
            textStyle={{ color: getStatusColor(order.status) }}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Chip>
        </View>

        <Text variant="bodyMedium" style={styles.dateText}>
          Placed on {formatDate(order.orderDate)}
        </Text>

        {order.status === 'pending' && (
          <PaperButton
            variant="tertiary"
            icon="close"
            onPress={handleCancelOrder}
            style={styles.cancelButton}
          >
            Cancel Order
          </PaperButton>
        )}
      </Surface>

      {/* Items Section */}
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Items</Text>
        <Divider style={styles.divider} />

        {order.items.map((item, index) => (
          <View key={index}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text variant="bodyLarge" style={styles.itemTitle}>
                  {item.title}
                </Text>
                <Text variant="bodyMedium">Producer: {item.producer}</Text>
                <Text variant="bodyMedium">Price: {item.price} × {item.quantity}</Text>
              </View>
              <Text variant="titleMedium">
                ${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}
              </Text>
            </View>
            {index < order.items.length - 1 && <Divider style={styles.itemDivider} />}
          </View>
        ))}

        <Divider style={styles.divider} />

        <View style={styles.totalRow}>
          <Text variant="titleMedium">Total</Text>
          <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
            {order.totalAmount}
          </Text>
        </View>
      </Surface>

      {/* Shipping Details Section */}
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Shipping Details</Text>
        <Divider style={styles.divider} />

        <View style={styles.detailRow}>
          <Text variant="bodyMedium" style={styles.detailLabel}>Name:</Text>
          <Text variant="bodyMedium" style={styles.detailValue}>
            {order.shippingDetails.fullName}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="bodyMedium" style={styles.detailLabel}>Address:</Text>
          <Text variant="bodyMedium" style={styles.detailValue}>
            {order.shippingDetails.address}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="bodyMedium" style={styles.detailLabel}>City:</Text>
          <Text variant="bodyMedium" style={styles.detailValue}>
            {order.shippingDetails.city}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="bodyMedium" style={styles.detailLabel}>State:</Text>
          <Text variant="bodyMedium" style={styles.detailValue}>
            {order.shippingDetails.state}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="bodyMedium" style={styles.detailLabel}>ZIP Code:</Text>
          <Text variant="bodyMedium" style={styles.detailValue}>
            {order.shippingDetails.zipCode}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="bodyMedium" style={styles.detailLabel}>Phone:</Text>
          <Text variant="bodyMedium" style={styles.detailValue}>
            {order.shippingDetails.phone}
          </Text>
        </View>
      </Surface>

      {/* Payment Method Section */}
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Payment Method</Text>
        <Divider style={styles.divider} />

        <Text variant="bodyLarge">
          {translatePaymentMethod(order.paymentMethod)}
        </Text>
      </Surface>
    </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    flex: 1,
    marginLeft: 8,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  itemDivider: {
    marginVertical: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  cancelButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 80,
  },
  detailValue: {
    flex: 1,
  },
  backButton: {
    marginTop: 16,
  },
});

export default OrderDetailsScreen;