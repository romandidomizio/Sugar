import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, Searchbar, List, Avatar, ActivityIndicator, Text, useTheme, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import debounce from 'lodash.debounce'; // Import debounce

// --- Import Services and Types ---
import AuthService from '../services/AuthService'; // Assuming searchUsers is here
// If RootStackParamList is defined elsewhere (e.g., MainNavigator), import it
// import { RootStackParamList } from '../navigation/MainNavigator'; // Adjust path if needed

// --- Define Local Types ---
// Define RootStackParamList *here* if not imported, ensuring it includes SelectRecipient and Chat
type RootStackParamList = {
  Messages: undefined;
  Chat: { recipientUsername: string; recipientId: string };
  SelectRecipient: undefined; // Make sure it's defined
  // Add other screens from your actual navigator
  // Example:
  // Loading: undefined;
  // Welcome: undefined;
  // Login: undefined;
  // Register: undefined;
  // ComponentPlayground: undefined;
  // BottomTab: undefined;
  // Cart: undefined;
  // Notifs: undefined;
  // Profile: undefined;
};

// Type for the navigation prop specific to this screen
type SelectRecipientNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelectRecipient'>;

// Type for user data returned by the search
interface SearchUser {
  _id: string;
  username: string;
}

const SelectRecipientScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<SelectRecipientNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Debounced Search Function ---
  // Use useCallback to ensure the debounced function identity is stable
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 1) { // Check length *inside* debounced function too
        setSearchResults([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const users = await AuthService.searchUsers(query);
        setSearchResults(users);
      } catch (err: any) {
        setError(err.message || 'Failed to search users.');
        setSearchResults([]); // Clear results on error
      } finally {
        setIsLoading(false);
      }
    }, 500), // Debounce time: 500ms - adjust as needed
    [] // Empty dependency array for useCallback
  );

  // --- Effect to Trigger Search ---
  useEffect(() => {
    // Trigger the debounced search when searchQuery changes
    debouncedSearch(searchQuery);

    // Cleanup function to cancel debounce timer if component unmounts or query changes quickly
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]); // Depend on searchQuery and the debounced function itself

  // --- Handler for Selecting a User ---
  const handleSelectUser = (user: SearchUser) => {
    console.log(`Selected user: ${user.username}, ID: ${user._id}`);
    // Navigate to Chat screen, passing recipient info
    navigation.navigate('Chat', {
      recipientUsername: user.username,
      recipientId: user._id,
    });
  };

  // --- Render User Item ---
  const renderUserItem = ({ item }: { item: SearchUser }) => (
    <List.Item
      title={item.username}
      left={props => <Avatar.Text {...props} size={40} label={item.username.substring(0, 2).toUpperCase()} />}
      onPress={() => handleSelectUser(item)}
      style={styles.listItem}
    />
  );

  // --- Render Content ---
  const renderContent = () => {
    if (isLoading && searchQuery.length > 0) { // Show loading only when actively searching
      return <ActivityIndicator animating={true} color={theme.colors.primary} style={styles.centerElement} />;
    }
    if (error) {
      return <Text style={[styles.placeholderText, { color: theme.colors.error }]}>{error}</Text>;
    }
    if (searchQuery.length > 0 && searchResults.length === 0 && !isLoading) {
        return <Text style={styles.placeholderText}>No users found matching "{searchQuery}".</Text>;
    }
    if (searchQuery.length === 0 && !isLoading) {
        return <Text style={styles.placeholderText}>Type a username to search.</Text>;
    }

    return (
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item._id}
        renderItem={renderUserItem}
        ItemSeparatorComponent={() => <Divider />}
        style={styles.list}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Custom Appbar */}
      <Appbar.Header elevated mode="small">
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="New Message" />
      </Appbar.Header>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search for users..."
          onChangeText={setSearchQuery} // Directly update state
          value={searchQuery}
          style={styles.searchbar}
          elevation={1}
        />
      </View>

      {/* Content Area (List, Loading, Error) */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: 'white', // Or theme.colors.surface
  },
   searchbar: {
    // Removed flexGrow: 1 as it's alone now
  },
  contentContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listItem: {
     paddingHorizontal: 15,
     paddingVertical: 5,
  },
  centerElement: {
      marginTop: 30,
  },
  placeholderText: {
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default SelectRecipientScreen;