import React, { useState, useCallback, useContext } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useTheme, Text, Divider, ActivityIndicator, List, Button, Avatar } from 'react-native-paper';
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useAppContext } from '../contexts/AppContext';
// Import navigation types
import { RootStackParamList, BottomTabParamList } from '../navigation/MainNavigator';

// --- Define Type for Food Item Data ---
// TODO: Potentially move this to a shared types file if used elsewhere
interface FoodItem {
  _id: string;
  title: string;
  producer: string;
  price: string;
  description: string;
  imageUri: string; // Expecting relative path like /uploads/image.jpg
  origin: string;
  certifications: string[];
  expiryDate: string; // Date as ISO string
  contactInfo: string;
  createdAt: string;
  unitType: string;
  quantity: string;
  sizeMeasurement: string;
}

// Define Navigation Prop Type for this screen
type MyListingsNavigationProp = NavigationProp<RootStackParamList>;

const MyListingsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<MyListingsNavigationProp>(); // Typed navigation hook

  // Get state from AppContext
  const { state } = useAppContext();
  const { token } = state.auth; // Extract token from auth state

  const [listings, setListings] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Delete Listing Function --- 
  const handleDeleteListing = async (listingId: string) => {
    // Confirmation dialog
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            if (!token) {
              Alert.alert('Error', 'Authentication token missing. Cannot delete listing.');
              return;
            }
            try {
              console.log(`[MyListingsScreen] Attempting delete for listing ID: ${listingId}`);
              await axios.delete(`${API_BASE_URL}/api/user/listings/${listingId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              // Remove item from state on success
              setListings(prevListings => prevListings.filter(item => item._id !== listingId));
              Alert.alert('Success', 'Listing deleted successfully.'); // Optional success feedback
            } catch (error: any) {
              console.error('Error deleting listing:', error);
              const errorMessage = error.response?.data?.error || 'Failed to delete listing. Please try again.';
              Alert.alert('Deletion Failed', errorMessage);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true } // Allow dismissal by tapping outside
    );
  };

  // --- Data Fetching Function ---
  const fetchMyListings = useCallback(async () => {
    // Check if the token exists from the context
    if (!token) {
      setError('Authentication token is missing. Please log in.');
      setLoading(false);
      // Optionally navigate to login screen
      return; 
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Verify this is the correct endpoint for fetching *user-specific* listings
      const response = await axios.get(`${API_BASE_URL}/api/user/me/listings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setListings(response.data);
    } catch (err: any) {
      console.error('Error fetching my listings:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch listings.');
      let alertMessage = 'Could not fetch your listings. Please try again later.';
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          alertMessage = 'Too many requests fetching listings. Please wait a moment and try again.';
        } else if (err.response?.data?.error) {
          alertMessage = err.response.data.error;
        }
      }
      Alert.alert('Error', alertMessage);
    } finally {
      setLoading(false);
    }
  }, [token]); // Depend on the token from context state

  // --- Use Focus Effect for Auto-Refresh ---
  useFocusEffect(
    useCallback(() => {
      fetchMyListings();
      // Optional cleanup function if needed
      // return () => console.log('MyListingsScreen blurred');
    }, [fetchMyListings]) // Depend on the memoized fetch function
  );

  // --- Styles (Moved inside component to access theme) --- 
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
    contentContainer: {
      padding: 10, // Add padding for list items
    },
    centeredMessageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    placeholderText: {
      textAlign: 'center',
      marginVertical: 16,
      color: theme.colors.onSurface, // Use theme color here
    },
    listItem: {
      backgroundColor: theme.colors.surface, // Use theme surface color
      marginHorizontal: 10,
      marginVertical: 4,
      borderRadius: 4,
      elevation: 1,
    },
    listItemTitle: {
      fontWeight: 'bold',
    },
    listItemDescription: {
      fontSize: 12,
    },
    actionIcon1Container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 14,
      transform: [{ scale: 1.1 }],
    },
    actionIcon2Container: {
      flexDirection: 'row',
      alignItems: 'center',
      transform: [{ scale: 1.1 }],
    },
    listContentContainer: {
      paddingBottom: 20, // Ensure space at the bottom
    },
    createButton: {
      marginTop: 16,
    },
  });

  // --- Render Item for FlatList ---
  const renderItem = ({ item }: { item: FoodItem }) => {
    // Format the price string
    const priceString = `$${Number(item.price).toFixed(2)} / ${item.unitType === 'unit' ? (item.quantity + ' unit(s)') : item.sizeMeasurement}`;

    // Format the description string
    const descriptionString = `Producer: ${item.producer}\nExpires: ${new Date(item.expiryDate).toLocaleDateString()}`;

    return (
      <List.Item
        title={item.title}
        description={`${priceString}\n${descriptionString}`}
        descriptionNumberOfLines={3} // Increase lines for new format
        left={props => {
          // Construct the full, safe image URI
          const imageSource = item.imageUri 
            ? { uri: `${API_BASE_URL}/${item.imageUri.startsWith('/') ? item.imageUri.substring(1) : item.imageUri}` }
            : require('../../assets/icon.png'); // Fallback image if needed
            
          // Log the constructed URI for debugging
          if(item.imageUri) {
            console.log(`[MyListingsScreen] Image URI for ${item.title}: ${imageSource.uri}`);
          }

          return <Avatar.Image {...props} size={50} source={imageSource} />;
        }}
        right={props => (
          <><View {...props} style={styles.actionIcon1Container}>
            {/* Wrap edit icon in TouchableOpacity to make it pressable */}
            {/* Corrected navigation: Navigate to EditListing screen in the Root Stack */}
            <TouchableOpacity onPress={() => navigation.navigate('EditListing', { listingId: item._id })}>
              <List.Icon icon="pencil-outline" />
            </TouchableOpacity>
          </View><View {...props} style={styles.actionIcon2Container}>
              {/* Wrap delete icon in TouchableOpacity to make it pressable */}
              <TouchableOpacity onPress={() => handleDeleteListing(item._id)}>
                <List.Icon icon="delete-outline" color={theme.colors.error} />
              </TouchableOpacity>
            </View></>
        )}
        style={styles.listItem}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
        // TODO: Add onPress handler for viewing/editing details?
        // onPress={() => console.log('Pressed item:', item._id)}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          My Listings
        </Text>
      </View>

      <Divider />

      {/* Content Area */}
      {loading ? (
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator animating={true} size="large" />
          <Text style={styles.placeholderText}>Loading your listings...</Text>
        </View>
      ) : error ? (
        <View style={styles.centeredMessageContainer}>
          <Text style={[styles.placeholderText, { color: theme.colors.error }]}>{error}</Text>
          <Button mode="outlined" onPress={fetchMyListings}>Retry</Button>
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.placeholderText}>You haven't posted any listings yet.</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('BottomTab', { screen: 'Post', params: {} })} 
            style={styles.createButton}
          >
            Create New Listing
          </Button>
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContentContainer}
          // Optional: Add pull-to-refresh
          // onRefresh={fetchMyListings}
          // refreshing={loading}
        />
      )}
    </View>
  );
};

export default MyListingsScreen;