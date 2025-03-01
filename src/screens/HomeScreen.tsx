import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme, Text, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { PaperCard } from '../components/paper';
import { PaperButton } from '../components/paper';
import { PaperModal } from '../components/paper';

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const marketplaceItems = [
    {
      id: '1',
      title: 'Fresh Organic Apples',
      producer: 'Green Valley Farms',
      price: '$2.99/lb',
      description: 'Locally grown, pesticide-free apples from our family farm.',
      imageUri: 'https://example.com/apples.jpg'
    },
    {
      id: '2',
      title: 'Homemade Sourdough Bread',
      producer: 'Artisan Bakery',
      price: '$6.50',
      description: 'Freshly baked sourdough, made with wild yeast starter.',
      imageUri: 'https://example.com/bread.jpg'
    }
  ];

  const handleLogout = () => {
    // Implement logout logic
    navigation.navigate('Login');
  };

  return (
    <ScrollView 
      style={[
        styles.container, 
        { backgroundColor: theme.colors.background }
      ]}
    >
      <View style={styles.headerContainer}>
        <Text 
          variant="headlineLarge" 
          style={[
            styles.title, 
            { color: theme.colors.primary }
          ]}
        >
          Sugar Marketplace
        </Text>
        
        <PaperButton
          mode="text"
          onPress={() => setLogoutModalVisible(true)}
          style={styles.logoutButton}
        >
          Logout
        </PaperButton>
      </View>

      <Divider />

      <View style={styles.marketplaceSection}>
        <Text 
          variant="titleLarge" 
          style={[
            styles.sectionTitle, 
            { color: theme.colors.primary }
          ]}
        >
          Local Marketplace
        </Text>

        {marketplaceItems.map(item => (
          <PaperCard
            key={item.id}
            title={item.title}
            subtitle={`Producer: ${item.producer}`}
            content={`${item.description}\n\nPrice: ${item.price}`}
            imageUri={item.imageUri}
            actions={
              <PaperButton 
                mode="contained" 
                onPress={() => console.log(`Added ${item.title} to cart`)}
              >
                Add to Cart
              </PaperButton>
            }
          />
        ))}
      </View>

      <PaperModal
        visible={logoutModalVisible}
        onDismiss={() => setLogoutModalVisible(false)}
        title="Logout Confirmation"
        content="Are you sure you want to log out?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
      />
    </ScrollView>
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
  },
  logoutButton: {
    marginLeft: 10,
  },
  marketplaceSection: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 15,
  },
});

export default HomeScreen;
