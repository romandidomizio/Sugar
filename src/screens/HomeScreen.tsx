// HomeScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useTheme, Text, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { PaperCard } from '../components/paper';
import { PaperButton } from '../components/paper';
import { PaperModal } from '../components/paper';
import { useCart } from '../contexts/CartContext'; // Import useCart

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { addToCart } = useCart(); // Use the CartContext

  const marketplaceItems = [
    {
      id: '1',
      title: 'Fresh Organic Apples',
      producer: 'Green Valley Farms',
      price: '$2.99/lb',
      description: 'Locally grown, pesticide-free apples from our family farm.',
      imageUri: 'https://example.com/apples.jpg',
    },
    {
      id: '2',
      title: 'Homemade Sourdough Bread',
      producer: 'Artisan Bakery',
      price: '$6.50',
      description: 'Freshly baked sourdough, made with wild yeast starter.',
      imageUri: 'https://example.com/bread.jpg',
    },
    {
      id: '3',
      title: 'Vanilla Cake',
      producer: 'Jane Doe',
      price: '$11.50',
      description: 'Vanilla layered cakes with buttercream frosting.',
      imageUri: 'https://example.com/cake.jpg',
    },
  ];

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  // Render item function for FlatList
  const renderItem = ({ item }) => (
    <PaperCard
      key={item.id}
      title={item.title}
      subtitle={`Producer: ${item.producer}`}
      content={`${item.description}\n\nPrice: ${item.price}`}
      imageUri={item.imageUri}
      actions={
        <PaperButton
          mode="contained"
          onPress={() => addToCart(item)} // Add item to cart
        >
          Add to Cart
        </PaperButton>
      }
    />
  );

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Header Section */}
      <View style={styles.headerContainer}>
        {/* Left-aligned Title */}
        <Text
          variant="headlineLarge"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Sugar Marketplace
        </Text>

        {/* Right-aligned Navbar with Logout Button Included */}
        <View style={styles.navBar}>
          <PaperButton mode="text" onPress={() => navigation.navigate('Cart')}>
            Cart
          </PaperButton>
          <PaperButton mode="text" onPress={() => console.log('Bell Clicked')}>
            Notifs
          </PaperButton>
          <PaperButton mode="text" onPress={() => console.log('Profile Clicked')}>
            Profile
          </PaperButton>
          <PaperButton
            mode="text"
            onPress={() => setLogoutModalVisible(true)}
            style={styles.logoutButton}
          >
            Logout
          </PaperButton>
        </View>
      </View>

      <Divider />

      {/* Marketplace Section */}
      <View style={styles.marketplaceSection}>
        <Text
          variant="titleLarge"
          style={[styles.sectionTitle, { color: theme.colors.primary }]}
        >
          Local Marketplace
        </Text>

        {/* FlatList with 3 columns */}
        <FlatList
          data={marketplaceItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3} // Display 3 cards per row
          columnWrapperStyle={styles.row} // Add margin between columns
        />
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
    flexDirection: 'row', // Arrange items horizontally
    justifyContent: 'space-between', // Space between title & nav buttons
    alignItems: 'center',
    padding: 20,
  },
  title: {
    flex: 1, // Push navbar to the right
    textAlign: 'left',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15, // Adds spacing between buttons
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
  row: {
    justifyContent: 'space-between', // Space between the cards in a row
    marginBottom: 20, // Space between rows
  },
});

export default HomeScreen;
// import React, { useState } from 'react';
// import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
// import { useTheme, Text, Divider } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
//
// import { PaperCard } from '../components/paper';
// import { PaperButton } from '../components/paper';
// import { PaperModal } from '../components/paper';
//
// const HomeScreen: React.FC = () => {
//   const theme = useTheme();
//   const navigation = useNavigation();
//   const [logoutModalVisible, setLogoutModalVisible] = useState(false);
//
//   const marketplaceItems = [
//     {
//       id: '1',
//       title: 'Fresh Organic Apples',
//       producer: 'Green Valley Farms',
//       price: '$2.99/lb',
//       description: 'Locally grown, pesticide-free apples from our family farm.',
//       imageUri: 'https://example.com/apples.jpg'
//     },
//     {
//       id: '2',
//       title: 'Homemade Sourdough Bread',
//       producer: 'Artisan Bakery',
//       price: '$6.50',
//       description: 'Freshly baked sourdough, made with wild yeast starter.',
//       imageUri: 'https://example.com/bread.jpg'
//     },
//     {
//       id: '3',
//       title: 'Vanilla Cake',
//       producer: 'Jane Doe',
//       price: '$11.50',
//       description: 'Vanilla layered cakes with buttercream frosting.',
//       imageUri: 'https://example.com/cake.jpg'
//     }
//   ];
//
//   const handleLogout = () => {
//     navigation.navigate('Login');
//   };
//
//   // Render item function for FlatList
//   const renderItem = ({ item }) => (
//     <PaperCard
//       key={item.id}
//       title={item.title}
//       subtitle={`Producer: ${item.producer}`}
//       content={`${item.description}\n\nPrice: ${item.price}`}
//       imageUri={item.imageUri}
//       actions={
//         <PaperButton
//           mode="contained"
//           onPress={() => console.log(`Added ${item.title} to cart`)}
//         >
//           Add to Cart
//         </PaperButton>
//       }
//     />
//   );
//
//   return (
//     <ScrollView
//       style={[
//         styles.container,
//         { backgroundColor: theme.colors.background }
//       ]}
//     >
//       {/* Header Section */}
//       <View style={styles.headerContainer}>
//         {/* Left-aligned Title */}
//         <Text
//           variant="headlineLarge"
//           style={[styles.title, { color: theme.colors.primary }]}
//         >
//           Sugar Marketplace
//         </Text>
//
//         {/* Right-aligned Navbar with Logout Button Included */}
//         <View style={styles.navBar}>
//           <PaperButton mode="text" onPress={() => console.log("Cart Clicked")}>Cart</PaperButton>
//           <PaperButton mode="text" onPress={() => console.log("Bell Clicked")}>Notifs</PaperButton>
//           <PaperButton mode="text" onPress={() => console.log("Profile Clicked")}>Profile</PaperButton>
//           <PaperButton
//             mode="text"
//             onPress={() => setLogoutModalVisible(true)}
//             style={styles.logoutButton}
//           >
//             Logout
//           </PaperButton>
//         </View>
//       </View>
//
//       <Divider />
//
//       {/* Marketplace Section */}
//       <View style={styles.marketplaceSection}>
//         <Text
//           variant="titleLarge"
//           style={[styles.sectionTitle, { color: theme.colors.primary }]}
//         >
//           Local Marketplace
//         </Text>
//
//         {/* FlatList with 3 columns */}
//         <FlatList
//           data={marketplaceItems}
//           renderItem={renderItem}
//           keyExtractor={(item) => item.id}
//           numColumns={3}  // Display 3 cards per row
//           columnWrapperStyle={styles.row}  // Add margin between columns
//         />
//       </View>
//
//       <PaperModal
//         visible={logoutModalVisible}
//         onDismiss={() => setLogoutModalVisible(false)}
//         title="Logout Confirmation"
//         content="Are you sure you want to log out?"
//         confirmText="Logout"
//         cancelText="Cancel"
//         onConfirm={handleLogout}
//       />
//     </ScrollView>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   headerContainer: {
//     flexDirection: 'row',  // Arrange items horizontally
//     justifyContent: 'space-between',  // Space between title & nav buttons
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     flex: 1,  // Push navbar to the right
//     textAlign: 'left',
//   },
//   navBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 15,  // Adds spacing between buttons
//   },
//   logoutButton: {
//     marginLeft: 10,
//   },
//   marketplaceSection: {
//     padding: 20,
//   },
//   sectionTitle: {
//     marginBottom: 15,
//   },
//   row: {
//     justifyContent: 'space-between',  // Space between the cards in a row
//     marginBottom: 20,  // Space between rows
//   },
// });
//
// export default HomeScreen;


