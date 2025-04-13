import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme, Text, Divider, Surface, IconButton } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PaperButton } from '../components/paper';

const OrderConfirmationScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, orderDate } = route.params as { orderId: string; orderDate: string };

  // Format the date
  const formattedDate = new Date(orderDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.iconContainer}>
        <IconButton
          icon="check-circle"
          size={80}
          iconColor={theme.colors.primary}
        />
      </View>

      <Text
        variant="headlineMedium"
        style={[styles.title, { color: theme.colors.primary }]}
      >
        Order Confirmed!
      </Text>

      <Text variant="bodyLarge" style={styles.message}>
        Thank you for your order. We've received your purchase request and will process it shortly.
      </Text>

      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Order Details</Text>
        <Divider style={styles.divider} />

        <View style={styles.detailRow}>
          <Text variant="bodyMedium" style={styles.detailLabel}>Order ID:</Text>
          <Text variant="bodyMedium">{orderId}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="bodyMedium" style={styles.detailLabel}>Date:</Text>
          <Text variant="bodyMedium">{formattedDate}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="bodyMedium" style={styles.detailLabel}>Status:</Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.primary, fontWeight: 'bold' }}
          >
            Processing
          </Text>
        </View>
      </Surface>

      <View style={styles.buttonContainer}>
        <PaperButton
          variant="tertiary"
          onPress={() => navigation.navigate('Profile')}
          style={styles.button}
        >
          View My Orders
        </PaperButton>

        <PaperButton
          variant="primary"
          onPress={() => navigation.navigate('Home')}
          style={styles.button}
        >
          Continue Shopping
        </PaperButton>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginHorizontal: 24,
    marginBottom: 32,
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
  detailRow: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    marginTop: 32,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default OrderConfirmationScreen;