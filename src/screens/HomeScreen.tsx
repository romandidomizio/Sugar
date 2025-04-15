import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  Image, // Re-add Image import
  Pressable,
} from 'react-native';
import {
  useTheme,
  Text,
  Divider,
  ActivityIndicator,
  Button,
  Card,
  Modal,
  Portal,
  Surface,
} from 'react-native-paper'; // AI: Removed Searchbar import
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // Import StackNavigationProp
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'; // Import BottomTabNavigationProp
import { CompositeNavigationProp } from '@react-navigation/native'; // Import CompositeNavigationProp
import { RootStackParamList, BottomTabParamList } from '../navigation/MainNavigator'; // Import param lists
import * as Location from 'expo-location'; // Import expo-location for geocoding
import axios from 'axios';
import { API_BASE_URL } from '@env';

console.log('[HomeScreen] API_BASE_URL:', API_BASE_URL); // Log API_BASE_URL on component load

import { useCart } from '../contexts/CartContext';
import SearchBar from '../components/SearchBar'; // AI: Import custom SearchBar

// Define composite navigation prop type
type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Home'>, // Navigation within BottomTab
  StackNavigationProp<RootStackParamList> // Navigation for Stack screens like Cart, Messages
>;

// Define Props including the composite navigation type
type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

// Define the interface for marketplace items
// Updated interface to include all potential fields from backend/usage
interface MarketplaceItem {
  _id: string;
  title: string;
  producer: string;
  price: number; // AI: Changed type to number
  description: string;
  imageUri: string | null; // Allow null if no image
  location?: { type: 'Point'; coordinates: [number, number] }; // Added specific location type
  origin?: string; // Optional: Added based on usage
  certifications?: string[]; // Optional: Added based on usage
  expiryDate?: string;
  contactInfo?: string; // Optional: Added based on usage (but hidden in modal)
  contactMethod?: 'Direct Message' | 'Phone Call' | 'Text' | 'Email'; // Assume specific values
//   userId: string;
    userId: { _id: string; username: string }; // Allow populated object (or string if sometimes not populated)

  createdAt: string;
  shareLocation?: boolean; // Optional: Added based on usage
  unitType?: string; // Optional: Added based on usage
  sizeMeasurement?: string; // Optional: Added based on usage
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { addToCart, items: cartItems } = useCart(); // Use the useCart hook

  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State for modal visibility and selected item
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);

  // --- Add State for Modal Location City and Geocoding Status ---
  const [modalLocationCity, setModalLocationCity] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  // --------------------------------------------------------------

  // --- Data Fetching Function ---
  const fetchMarketplaceItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetching all items for the general marketplace - Use the correct endpoint
      const response = await axios.get<MarketplaceItem[]>(`${API_BASE_URL}/api/listings`); // Changed from /api/marketplace

      // Check if the response data itself is an array
      if (response.data && Array.isArray(response.data)) {
        // Sort the array directly from the response data
        const sortedItems = response.data.sort((a, b) => {
          // Ensure createdAt exists and handle potential invalid dates
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0; 
          return dateB - dateA; // Sort descending (newest first)
        });
        setMarketplaceItems(sortedItems);
      } else {
        console.error('API response is not an array:', response.data);
        setError('Failed to load listings due to unexpected data format.');
        setMarketplaceItems([]); // Set to empty array or handle as appropriate
      }
    } catch (err: any) {
      console.error('Error fetching marketplace items:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch marketplace items.';
      setError(errorMessage);
      Alert.alert('Error', `${errorMessage} Please try again later.`);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array, fetch logic doesn't depend on component state here

  // --- Function to fetch city name from coordinates ---
  const fetchCityName = async (coordinates: [number, number] | undefined) => {
    if (!coordinates || coordinates.length !== 2) {
      setModalLocationCity('Location data unavailable');
      return;
    }

    // Coordinates are [longitude, latitude]
    const latitude = coordinates[1];
    const longitude = coordinates[0];

    setIsGeocoding(true);
    setModalLocationCity(null); // Clear previous city

    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0 && result[0].city) {
        setModalLocationCity(result[0].city);
      } else {
        setModalLocationCity('Unknown Location');
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
      setModalLocationCity('Could not fetch location');
    } finally {
      setIsGeocoding(false);
    }
  };
  // ------------------------------------------------------

  // --- Use Focus Effect for Auto-Refresh ---
  useFocusEffect(
    useCallback(() => {
      fetchMarketplaceItems();
      // Optional cleanup
      // return () => console.log('HomeScreen blurred');
    }, [fetchMarketplaceItems])
  );

  // Count items in cart for badge
  const cartItemCount = cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);

  // --- Filter Data --- 
  // Helper function to parse price string (handles '$', ',', etc.)
  // AI: Adjusted parsePrice - its relevance might decrease if price is always a number now.
  // It mainly handles potential formatting issues if data was inconsistent.
  // If price is guaranteed number, direct use might be better.
  // Keeping a safe version for now.
  const parsePrice = (priceInput: number | string | undefined | null): number => {
    if (typeof priceInput === 'number') {
      return priceInput; // Already a number
    }
    if (typeof priceInput === 'string') {
      // Remove '$' and ',' before parsing
      const cleanedPrice = priceInput.replace(/[$,]/g, ''); 
      const price = parseFloat(cleanedPrice);
      return isNaN(price) ? 0 : price; // Return 0 if parsing fails
    }
    return 0; // Default to 0 for null, undefined, or other types
  };

  const freeItems = marketplaceItems.filter(item => parsePrice(item.price) === 0);
  const paidItems = marketplaceItems.filter(item => parsePrice(item.price) > 0);
  const filteredItems = marketplaceItems.filter((item) => {
  const query = searchQuery.toLowerCase();
  return (
    item.title.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query) ||
    item.producer.toLowerCase().includes(query)
  );
});

  // --- Modal Handling Functions ---
  const handleCardPress = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setModalVisible(true);
    setModalLocationCity(null); // Reset city on new modal open
    setIsGeocoding(false);    // Reset geocoding status

    // Check if location is shared and coordinates exist, then fetch city
    if (item.shareLocation && item.location?.coordinates) {
      fetchCityName(item.location.coordinates);
    }
  };

  const handleModalDismiss = () => {
    setModalVisible(false);
    setModalLocationCity(null); // Clear city on dismiss
    setSelectedItem(null); // Clear selected item as well
  };

  // --- Button Handlers (Placeholders) --- //
  const handleAddToCart = () => {
    if (selectedItem) {
      // Map MarketplaceItem to CartItem structure expected by addToCart
      // Fixing lint d714d6ff by adding missing properties
      const itemToAdd = {
        id: selectedItem._id, // Map _id to id for CartItem
        _id: selectedItem._id,
        title: selectedItem.title,
        price: selectedItem.price,
        // Fixing lint 6a683a3a: Provide fallback for potentially null imageUri
        imageUri: selectedItem.imageUri ?? '', // Use empty string if imageUri is null
        producer: selectedItem.producer, // Add producer
        description: selectedItem.description, // Add description
        // Ensure all fields required by Omit<CartItem, "quantity"> are present
      };
      addToCart(itemToAdd); // Add item to cart via context

      // Show confirmation alert with navigation options
      Alert.alert(
        'Item Added',
        `${selectedItem.title} has been added to your favorites.`,
        [
          {
            text: 'Keep Shopping',
            onPress: () => handleModalDismiss(), // Close modal on press
            style: 'cancel',
          },
          {
            text: 'Go to Cart',
            onPress: () => {
              handleModalDismiss(); // Close modal first
              navigation.navigate('Cart'); // Navigate to Cart screen
            },
          },
        ],
        { cancelable: false } // Prevent dismissing alert by tapping outside
      );
    } else {
      console.error('Cannot add to cart, selectedItem is null');
      Alert.alert('Error', 'Could not add item to cart.');
    }
  };

  const handleMessageSeller = () => {
    // Ensure an item is selected
    if (!selectedItem) {
      Alert.alert('Error', 'No item selected.');
      return;
    }

    // Retrieve contact method and info from the selected item
    const method = selectedItem.contactMethod;
    const info = selectedItem.contactInfo;

    // Close the modal regardless of the action taken
    handleModalDismiss(); // Close modal for all actions or info display

    // Handle contact based on the method chosen by the seller
    switch (method) {
      case 'Direct Message': // Match value saved from PostScreen
        // Navigate to the messages screen for direct messaging
        console.log(`Navigating to direct messages for item: ${selectedItem.title}`);
        navigation.navigate('Messages'); // Adjust 'Messages' if screen name is different
        break;

      case 'Text': // Match value saved from PostScreen
        // Show an alert prompting the user to text the seller's number
        if (info) {
          Alert.alert('Contact Seller', `Text the seller at: ${info}`);
        } else {
          // Handle missing contact info for the chosen method
          Alert.alert('Contact Seller', 'Seller contact number is not available.');
        }
        break;

      case 'Phone Call': // Match value saved from PostScreen
        // Show an alert prompting the user to call the seller's number
        if (info) {
          Alert.alert('Contact Seller', `Call the seller at: ${info}`);
        } else {
          // Handle missing contact info for the chosen method
          Alert.alert('Contact Seller', 'Seller contact number is not available.');
        }
        break;

      case 'Email': // Match value saved from PostScreen
        // Show an alert prompting the user to email the seller's address
        if (info) {
          Alert.alert('Contact Seller', `Email the seller at: ${info}`);
        } else {
          // Handle missing contact info for the chosen method
          Alert.alert('Contact Seller', 'Seller email address is not available.');
        }
        break;

      default:
        // Handle cases where the contact method is missing or unrecognized
        console.warn(`Unknown or missing contact method for item: ${selectedItem.title}`);
        Alert.alert('Contact Seller', 'Contact information is not available for this seller.');
        break;
    }
  };

  // --- Helper Functions ---
  // Capitalizes the first letter of each word and replaces underscores
  const formatOrigin = (originString?: string): string => {
    if (!originString) return 'N/A';
    return originString
      .replace(/_/g, ' ') // Replace underscores with spaces
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Cleans potential extra characters from certification strings
  const cleanAndFormatCertifications = (certs?: string[]): string => {
    if (!certs || certs.length === 0) {
      return 'None';
    }
    return certs
      .map(cert => cert.replace(/[\["'\]]/g, '')) // Remove brackets and quotes
      .filter(cert => cert.trim().length > 0) // Remove empty strings after cleaning
      .join(', ');
  };

  // Helper to format price with unit/size
  const formatPrice = (item: MarketplaceItem): string => {
    // AI: Directly use the numeric price. Handle 0 specifically for 'Free'.
    const priceValue = item.price; // Price is now a number

    if (typeof priceValue !== 'number' || isNaN(priceValue)) {
      return 'N/A'; // Handle cases where price might still be invalid/missing
    }

    if (priceValue === 0) {
      return 'Free'; // Display 'Free' for $0.00 items
    }

    const formattedPrice = `$${priceValue.toFixed(2)}`; // Format number to 2 decimal places

    // Prioritize sizeMeasurement if it exists
    if (item.sizeMeasurement) {
      return `${formattedPrice} / ${item.sizeMeasurement}`;
    } 
    // Otherwise, use unitType if it's meaningful
    else if (item.unitType && item.unitType !== 'N/A' && item.unitType !== 'other') {
      return `${formattedPrice} / ${item.unitType}`;
    }

    return formattedPrice;
  };

  // Render item function for FlatList
  const renderItem = ({ item }: { item: MarketplaceItem }) => {
    const imageSource = item.imageUri && (item.imageUri.startsWith('http://') || item.imageUri.startsWith('https://'))
      ? { uri: item.imageUri }
      : null; // AI: Ensure placeholder logic is fully removed

    const displayPrice = formatPrice(item);
    const isFree = displayPrice === 'Free';

    return (
      // Wrap custom View in Pressable to trigger modal
      <Pressable onPress={() => handleCardPress(item)}
                 style={({ pressed }) => [ { opacity: pressed ? 0.8 : 1.0 } ]} // Basic press feedback
      >
        {/* Shadow Wrapper View - Apply shadow and margins here */}
        <View style={styles.shadowWrapper}>
          {/* Custom Card Container using View - Handles content, bg, border radius, overflow */}
          <View style={styles.customCardContainer}>
            {/* Custom Cover Image */}
            <View style={styles.imageContainer}>
              {imageSource ? (
                <Image 
                  source={imageSource} 
                  style={styles.customCardCoverImage}
                  resizeMode='cover' // Ensure image covers the area
                  onError={(error) => console.warn(`[HomeScreen Card] Image load error for ${item._id}:`, error.nativeEvent.error)}
                />
              ) : (
                null // AI: Ensure placeholder logic is fully removed
              )}
              {/* AI: Price/Free Tag positioned over the image */} 
              {!isFree && (
                <View style={styles.priceTagContainer}>
                  <Text style={styles.priceTagText}>{displayPrice}</Text>
                </View>
              )}
              {isFree && (
                <View style={styles.freeTagContainer}> 
                  <Text style={styles.freeTagText}>Free</Text>
                </View>
              )}
            </View>
            {/* Custom Card Content Area */}
            <View style={styles.customCardContent}>
              {/* AI: Content Top Section (Title, Free Tag, Description) */} 
              <View style={styles.contentTopSection}> 
                {/* AI: Ensure Title Text is present and uses correct style */} 
                <Text 
                  variant="titleMedium" 
                  style={styles.cardTitle} 
                >
                  {item.title}
                </Text>
                <Text 
                  variant="bodySmall" 
                  style={styles.cardDescription} 
                  numberOfLines={2} 
                  ellipsizeMode='tail'
                >
                  {item.description}
                </Text>
              </View>
              {/* Bottom Row: Expiration Date (aligned right) */} 
              <View style={styles.cardBottomRow}>
                {item.expiryDate && typeof item.expiryDate === 'string' && item.expiryDate.length > 0 && (
                  <Text variant="labelSmall" style={styles.cardExpiration}>
                    Expires: {(() => {
                      try {
                        const date = new Date(item.expiryDate);
                        if (isNaN(date.getTime())) { return null; }
                        return date.toLocaleDateString();
                      } catch (e) {
                        return null;
                      }
                    })() || 'Invalid/Error'}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  // --- Define Styles Inside Component to Access Theme --- 
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollViewContent: {
      paddingVertical: 0, // Apply padding to the scroll content instead
    },
    sectionContainer: {
      marginBottom: 0, // Space between sections
      paddingHorizontal: 10, // Reduce horizontal padding to move content left
    },
    sectionTitle: {
      marginLeft: 10,
      fontSize: 20,
      marginBottom: 0, // Space below title
      marginTop: -5, // Space above title
    },
    // --- Styles for Custom Card --- START
    shadowWrapper: { // Wrapper to handle shadow separately from overflow:hidden
      marginVertical: 5,
      marginHorizontal: 5,
      // iOS Shadow Properties
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 1 }, 
      shadowOpacity: 0.30, 
      shadowRadius: 2.00,
    },
    customCardContainer: {
      width: 200, 
      height: 240, 
      backgroundColor: theme.colors.surface, 
      borderRadius: 8, 
      overflow: 'hidden', // Keep for clipping image corners
      // Android Shadow
      elevation: 8, 
    },
    customCardCoverImage: {
      width: '100%', // Fill container width
      height: 130, // Keep desired height
      // Apply radius only to top corners to match container
      borderTopLeftRadius: 8, 
      borderTopRightRadius: 8,
    },
    customCardContent: {
      paddingVertical: 8, // Adjusted vertical padding
      paddingHorizontal: 12, // Keep horizontal padding
      flexDirection: 'column', // AI: Ensure vertical stacking
      flex: 1, // AI: Allow content area to grow and fill available space
    },
    // --- Styles for Custom Card --- END

    cardTitle: {
      fontWeight: 'bold',
      marginBottom: 4, // Add some space below the title if it wraps
    },
    cardProducer: { // Added back to fix lint error
      marginTop: -2, // Space below title/price row
      marginBottom: 4, // Slightly reduce space below title/price row
    },
    cardDescription: {
      marginTop: 4, // Keep space below producer
      color: theme.colors.onSurfaceVariant, // Slightly muted color for description
    },
    cardExpiration: {
      marginTop: 8,
      color: theme.colors.onSurfaceVariant, // Use a less prominent color
      fontSize: 10,
    },
    cardTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start', // Align items to the top
      marginBottom: 4, // Space below the top row
    },
    cardPriceContainer: {
      flexDirection: 'row', // Keep price parts together
      alignItems: 'baseline', // Align text nicely
    },
    cardPriceAmount: {
      fontSize: 16, // Adjust size as needed
      fontWeight: 'bold',
      color: theme.colors.primary, // Use primary green color
    },
    cardPriceUnit: {
      fontSize: 12, // Smaller size for the unit
      fontWeight: 'normal', // Thinner font
      color: theme.colors.primary, // Use primary green color
      marginLeft: 2, // Small space between amount and unit
    },
    cardBottomRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end', // Align expiration to the right
      marginTop: 'auto', // AI: Push this row to the bottom of the flex container
    },
    // --- Styles for Loading/Error/Empty States --- START
    centeredMessageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    messageText: {
      textAlign: 'center',
      marginVertical: 16,
      color: theme.colors.onSurface, // Use theme color
    },
    retryButton: {
      marginTop: 10,
    },
    emptySectionText: {
      marginLeft: 15, // Align with section padding
      fontStyle: 'italic',
      color: theme.colors.onSurfaceVariant, // Use theme color
    },
    divider: {
      marginVertical: 10, // Space around the divider
      backgroundColor: theme.colors.outlineVariant, // Use a subtle theme color
    },
    // --- Styles for Loading/Error/Empty States --- END

    // --- Modal Styles --- //
    modalContainer: { // Style for the Modal wrapper itself
      padding: 20, // Padding around the Surface
      margin: 20, // Margin from screen edges
      marginTop: 50, // Add margin top
      marginBottom: 50, // Add margin bottom
    },
    modalContentContainer: {
      backgroundColor: theme.colors.surface, // Use theme surface color for modal background
      padding: 20, // Padding around the Surface
      margin: 20, // Margin from screen edges
      marginTop: 50, // Add margin top
      maxHeight: '85%', // Max height to prevent full screen takeover
      justifyContent: 'center', // Center Surface vertically if maxHeight isn't hit
    },
    modalSurface: { // Style for the content background
      padding: 15,
      borderRadius: 10, // Match container radius
    },
    modalScroll: { // ScrollView takes available space
      marginBottom: 15, // Space above the buttons
    },
    modalTitle: {
      fontSize: 30,
      fontWeight: 'bold',
      marginBottom: -10, // Add space below title
      textAlign: 'center',
    },
    modalImage: {
      width: '90%', // Use percentage for responsiveness
      aspectRatio: 1, // Maintain square aspect ratio, adjust as needed
      alignSelf: 'center',
      marginBottom: 0, // Space below image (adjust if needed after moving)
      borderRadius: 8, // Optional: rounded corners
      padding: 10,
    },
    detailText: {
      fontSize: 16,
      marginBottom: 8,
    },
    buttonContainer: {
      flexDirection: 'row', // Arrange buttons side-by-side
      justifyContent: 'space-around', // Space out buttons
      paddingTop: 10, // Add some padding above buttons if needed
      borderTopWidth: StyleSheet.hairlineWidth, // Optional separator line
      borderTopColor: theme.colors.outlineVariant, // Optional separator color
    },
    modalButton: {
      flex: 1, // Make buttons share space
      marginHorizontal: 5, // Add space between buttons
    },
    modalLocationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center', // Vertically align items in the row
      marginTop: 8, // Add some space above the location info
      minHeight: 24, // Ensure consistent height even when loading
    },
    modalLabel: {
      fontSize: 16,
      fontWeight: '500',
    },
    modalValue: {
      fontSize: 16,
    },
    placeholderImage: {
      backgroundColor: theme.colors.surfaceVariant, // Use a subtle background color
      justifyContent: 'center', // Center the text vertically
      alignItems: 'center', // Center the text horizontally
    },
    placeholderText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant, // Use a less prominent color
    },
    // --- Styles for Listing Cards --- START
    imageContainer: {
      position: 'relative', // Needed for absolute children positioning
    },
    priceTagContainer: {
      position: 'absolute',
      bottom: 8, // Adjust spacing from bottom
      right: 8, // Adjust spacing from right
      backgroundColor: 'rgba(255, 255, 255, 0.9)', // White background with slight transparency
      borderRadius: 8, // Rounded corners
      paddingHorizontal: 8,
      paddingVertical: 4,
      elevation: 2, // Add slight shadow for depth (Android)
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
    },
    priceTagText: {
      color: '#4CAF50', // Green color for price
      fontWeight: 'bold',
      fontSize: 14, // Adjust font size as needed
    },
    contentTopSection: {
      marginBottom: 4, // Add space between top section and bottom row
    },
    freeTagContainer: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
    },
    freeTagText: {
      color: theme.colors.primary, // Use theme primary color for 'Free'
      fontWeight: 'bold',
      fontSize: 14, 
    },
    // --- Styles for Listing Cards --- END
    searchbarWrapper: { // AI: Style for the View wrapping the Searchbar
      height: 40,         // Desired wrapper height
      marginTop: 10,       // Space above the search bar
      justifyContent: 'center', // Center Searchbar vertically if needed
    },
    dividerStyle: { // AI: Style for the divider below search bar
      marginVertical: 10, // Add vertical space around the divider
    },
  });

  // --- Render Loading State --- 
  if (loading) {
    return (
      <View style={styles.centeredMessageContainer}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.messageText}>Loading marketplace...</Text>
      </View>
    );
  }

  // --- Render Error State --- 
  if (error) {
    return (
      <View style={styles.centeredMessageContainer}>
        <Text style={[styles.messageText, { color: theme.colors.error }]}>{error}</Text>
        <Button mode="outlined" onPress={fetchMarketplaceItems} style={styles.retryButton}>Retry</Button>
      </View>
    );
  }

  // --- Render Content --- 
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
      {/* AI: Wrap Searchbar in a View to control height/margin */} 
      <View style={styles.searchbarWrapper}> 
        {/* AI: Use the custom SearchBar */} 
        <SearchBar
          placeholder="Search listings..."
          searchQuery={searchQuery} // Prop expected by custom component?
          setSearchQuery={setSearchQuery} // Prop expected by custom component?
        />
      </View>
      {/* AI: Add Divider below search bar */} 
      <Divider style={styles.dividerStyle} />

      {/* Section for Free Items */}
      <View style={styles.sectionContainer}>
        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Free
        </Text>
        {freeItems.length > 0 ? (
          <FlatList
            data={filteredItems.filter(item => parsePrice(item.price) === 0)}
            renderItem={renderItem}
            keyExtractor={(item) => `free-${item._id}`}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0 }} // Remove internal list padding
          />
        ) : (
          <Text style={styles.emptySectionText}>No free items available right now.</Text>
        )}
      </View>

      <Divider style={styles.divider} />

      {/* Section for Paid Items */}
      <View style={styles.sectionContainer}>
        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Other
        </Text>
        {paidItems.length > 0 ? (
          <FlatList
            data={filteredItems.filter(item => parsePrice(item.price) > 0)}
            renderItem={renderItem}
            keyExtractor={(item) => `paid-${item._id}`}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0 }} // Remove internal list padding
          />
        ) : (
          <Text style={styles.emptySectionText}>No other items available right now.</Text>
        )}
      </View>

      {/* Display if both lists are empty after loading */}
      {!loading && !error && freeItems.length === 0 && paidItems.length === 0 && (
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.messageText}>Marketplace is empty.</Text>
        </View>
      )}
      {/* --- Item Detail Modal --- */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={handleModalDismiss}
          contentContainerStyle={styles.modalContainer} // Use style for padding/margin
        >
          <Surface style={styles.modalSurface} elevation={4}>
            {selectedItem && ( // Only render content if an item is selected
              <>
                {/* ScrollView for details - occupies available space */}
                <ScrollView style={styles.modalScroll}> 
                  <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                  {(() => {
                    const modalImageSource = selectedItem.imageUri && (selectedItem.imageUri.startsWith('http://') || selectedItem.imageUri.startsWith('https://'))
                      ? { uri: selectedItem.imageUri }
                      : null; // Or placeholder

                    return modalImageSource ? (
                      <Image
                        source={modalImageSource}
                        style={styles.modalImage}
                        resizeMode="contain" // Ensure the entire image fits
                        onError={(error) => console.warn(`[HomeScreen Modal] Image load error for ${selectedItem._id}:`, error.nativeEvent.error)}
                      />
                    ) : (
                      <View style={[styles.modalImage, styles.placeholderImage]} >
                         <Text style={styles.placeholderText}>No Image</Text>
                      </View>
                    );
                  })()}
                              {/* --- MODIFIED LINE --- */}
                              <Text style={styles.detailText}>
                                Seller: {selectedItem?.userId?.username || 'N/A'}
                              </Text>
                              {/* --------------------- */}
                  <Text style={styles.detailText}>Producer: {selectedItem.producer || 'N/A'}</Text>
                  <Text style={styles.detailText}>Price: {formatPrice(selectedItem)}</Text>
                  <Text style={styles.detailText}>Description: {selectedItem.description || 'N/A'}</Text>
                  <Text style={styles.detailText}>Origin: {formatOrigin(selectedItem.origin)}</Text>
                  <Text style={styles.detailText}>Certifications: {cleanAndFormatCertifications(selectedItem.certifications)}</Text>
                  <Text style={styles.detailText}>Expires: {selectedItem.expiryDate ? new Date(selectedItem.expiryDate).toLocaleDateString() : 'N/A'}</Text>
                  {/* --- Display Location City Name --- */} 
                  {selectedItem.shareLocation && (
                    <View style={styles.modalLocationContainer}>
                      <Text variant="bodyMedium" style={styles.modalLabel}>Location: </Text>
                      {isGeocoding ? (
                        <ActivityIndicator size="small" />
                      ) : (
                        <Text variant="bodyMedium" style={styles.modalValue}>
                          {modalLocationCity || 'Not available'}
                        </Text>
                      )}
                    </View>
                  )}
                  {/* ----------------------------------- */} 
                  {/* Omitted: _id, userId, createdAt, contactInfo */}
                </ScrollView>

                {/* Button Container - Fixed at the bottom */}
                <View style={styles.buttonContainer}> 
<Button
  mode="contained"
  icon="heart" // Or "heart-outline"
  onPress={handleAddToCart}
  style={styles.modalButton}
>
                    Add
                  </Button>
                  <Button 
                    mode="outlined" 
                    onPress={handleMessageSeller} // Use defined handler
                    style={styles.modalButton}
                  >
                    Message Seller
                  </Button>
                </View>
              </>
            )}
          </Surface>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

export default HomeScreen;
