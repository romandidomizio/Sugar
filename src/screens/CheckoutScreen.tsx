import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme, Text, Divider, TextInput, RadioButton, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

import { PaperButton } from '../components/paper';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AppContext'; // Assuming you have an auth context

const CheckoutScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth(); // Get current user from auth context

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    paymentMethod: 'creditCard',
  });

  // Form validation state
  const [errors, setErrors] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    // Validate required fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
      valid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
      valid = false;
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
      valid = false;
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
      valid = false;
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP Code is required';
      valid = false;
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP Code';
      valid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      Alert.alert('Form Error', 'Please fix the errors in the form');
      return;
    }

    try {
      // Create order object
      const order = {
        userId: user?._id,
        items: items.map(item => ({
          itemId: item.id,
          title: item.title,
          producer: item.producer,
          price: item.price,
          quantity: item.quantity
        })),
        shippingDetails: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone,
        },
        paymentMethod: formData.paymentMethod,
        totalAmount: getTotal(),
        status: 'pending',
        orderDate: new Date()
      };

      // Submit order to the API
      const response = await axios.post('http://localhost:3000/api/orders', order);

      // If successful, clear cart and navigate to order confirmation
      if (response.status === 201) {
        clearCart();
        navigation.navigate('OrderConfirmation', {
          orderId: response.data._id,
          orderDate: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert(
        'Checkout Failed',
        'There was a problem processing your order. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Checkout
        </Text>
      </View>

      <Divider />

      {/* Order Summary */}
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Order Summary</Text>
        <Divider style={styles.divider} />

        {items.map(item => (
          <View key={item.id} style={styles.summaryItem}>
            <Text variant="bodyMedium">
              {item.quantity} x {item.title}
            </Text>
            <Text variant="bodyMedium">
              {parseFloat(item.price.replace('$', '')) * item.quantity}
            </Text>
          </View>
        ))}

        <Divider style={styles.divider} />
        <View style={styles.totalRow}>
          <Text variant="titleMedium">Total</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
            {getTotal()}
          </Text>
        </View>
      </Surface>

      {/* Shipping Information */}
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Shipping Information</Text>
        <Divider style={styles.divider} />

        <View style={styles.inputContainer}>
          <TextInput
            label="Full Name"
            value={formData.fullName}
            onChangeText={(text) => handleInputChange('fullName', text)}
            mode="outlined"
            error={!!errors.fullName}
          />
          {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="Address"
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            mode="outlined"
            error={!!errors.address}
          />
          {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <TextInput
              label="City"
              value={formData.city}
              onChangeText={(text) => handleInputChange('city', text)}
              mode="outlined"
              error={!!errors.city}
            />
            {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
          </View>

          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <TextInput
              label="State"
              value={formData.state}
              onChangeText={(text) => handleInputChange('state', text)}
              mode="outlined"
              error={!!errors.state}
            />
            {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <TextInput
              label="ZIP Code"
              value={formData.zipCode}
              onChangeText={(text) => handleInputChange('zipCode', text)}
              mode="outlined"
              keyboardType="numeric"
              error={!!errors.zipCode}
            />
            {errors.zipCode ? <Text style={styles.errorText}>{errors.zipCode}</Text> : null}
          </View>

          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <TextInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              mode="outlined"
              keyboardType="phone-pad"
              error={!!errors.phone}
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>
        </View>
      </Surface>

      {/* Payment Method */}
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Payment Method</Text>
        <Divider style={styles.divider} />

        <RadioButton.Group
          onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
          value={formData.paymentMethod}
        >
          <RadioButton.Item
            label="Credit Card"
            value="creditCard"
            labelStyle={styles.radioLabel}
          />
          <RadioButton.Item
            label="PayPal"
            value="paypal"
            labelStyle={styles.radioLabel}
          />
          <RadioButton.Item
            label="Cash on Delivery"
            value="cod"
            labelStyle={styles.radioLabel}
          />
        </RadioButton.Group>
      </Surface>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <PaperButton
          variant="tertiary"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Back to Cart
        </PaperButton>
        <PaperButton
          variant="primary"
          onPress={handlePlaceOrder}
          style={styles.button}
        >
          Place Order
        </PaperButton>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
  },
  title: {
    textAlign: 'left',
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
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
  },
  inputContainer: {
    marginBottom: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  radioLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default CheckoutScreen;