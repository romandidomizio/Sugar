import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { useTheme, Text, Divider, Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

import { PaperCard } from '../components/paper';
import { PaperButton } from '../components/paper';
import { useCart } from '../contexts/CartContext';

// Define the item interface to match CartItem
interface MarketplaceItem {
  id: string;
  title: string;
  producer: string;
  price: string;
  description: string;
  imageUri: string;
  _id: string;
}

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { addToCart, items } = useCart(); // Use the CartContext

  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/marketplace');
        setMarketplaceItems(response.data);
      } catch (error) {
        console.error('Error fetching food items:', error);
      }
    };
    fetchFoodItems();
  }, []);

  // Count items in cart for badge
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Render item function for FlatList
  const renderItem = ({ item }: { item: MarketplaceItem }) => (
    <PaperCard
      key={item._id}
      title={item.title}
      subtitle={`Producer: ${item.producer}`}
      content={`${item.description}\n\nPrice: ${item.price}`}
      imageUri={item.imageUri}
      actions={
        <PaperButton
          variant="primary"
          onPress={() => {
            addToCart(item);
            Alert.alert(
              'Added to Cart',
              `${item.title} has been added to your cart!`,
              [{ text: 'OK' }]
            );
          }}
        >
          Add to Cart
        </PaperButton>
      }
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={marketplaceItems}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View>
            <Divider />

            {/* Marketplace Section */}
            <View style={styles.marketplaceSection}>
              <Text
                variant="titleLarge"
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Marketplace
              </Text>
            </View>
          </View>
        }
        numColumns={3} // Display 3 cards per row
        columnWrapperStyle={styles.row} // Add margin between columns
        contentContainerStyle={styles.container}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  marketplaceSection: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  row: {
    justifyContent: 'space-between', // Space between the cards in a row
    marginBottom: 20, // Space between rows
  },
});

export default HomeScreen;
