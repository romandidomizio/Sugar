import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme, Text, Divider, Avatar, TextInput, Snackbar } from 'react-native-paper';
import { PaperButton } from '../components/paper';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../contexts/AppContext';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
//   const { state, logout } = useAppContext();
//   const { user, isAuthenticated } = state.auth;
const { state, logout, addBalance } = useAppContext(); // <-- Make sure addBalance is destructured
const { user, isAuthenticated } = state.auth;
const [amountToAdd, setAmountToAdd] = React.useState<string>('');
const [isLoading, setIsLoading] = React.useState<boolean>(false);
const [snackbarVisible, setSnackbarVisible] = React.useState<boolean>(false);
const [snackbarMessage, setSnackbarMessage] = React.useState<string>('');

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login');
  };

  // Inside the ProfileScreen component, define this async function:
  const handleAddBalance = async () => {
    const numericAmount = parseFloat(amountToAdd);

    // --- Validation ---
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setSnackbarMessage('Please enter a valid positive amount.');
      setSnackbarVisible(true);
      return;
    }

    // --- Start Loading ---
    setIsLoading(true);
    setSnackbarMessage(''); // Clear previous messages
    setSnackbarVisible(false);

    try {
      // --- Call Context Function ---
      const success = await addBalance(numericAmount); // The function you added to AppContext

      // --- Handle Response ---
      if (success) {
        setAmountToAdd(''); // Clear input on success
        setSnackbarMessage('Balance updated successfully!');
        setSnackbarVisible(true);
        // The balance displayed above will update automatically because
        // AppContext dispatched UPDATE_USER, triggering a re-render
      } else {
        // Error message handled by AppContext/AuthService, but provide generic feedback
        setSnackbarMessage('Failed to update balance. Please try again.');
        setSnackbarVisible(true);
      }
    } catch (error) {
      // Catch any unexpected errors during the process
      console.error("Error in handleAddBalance:", error);
      setSnackbarMessage('An unexpected error occurred.');
      setSnackbarVisible(true);
    } finally {
      // --- Stop Loading ---
      setIsLoading(false);
    }
  };


  // If not authenticated
  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text variant="bodyLarge" style={{ marginBottom: 16 }}>
          Please log in to view your profile
        </Text>
        <PaperButton
          mode="contained"
          onPress={() => navigation.navigate('Login')}
        >
          Go to Login
        </PaperButton>
      </View>
    );
  }

  // Show user profile
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <Text
          variant="headlineLarge"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Profile
        </Text>
      </View>

      <Divider />

      <View style={styles.contentContainer}>
        <View style={styles.avatarContainer}>
          <Avatar.Text
            size={80}
            label={user.name ? user.name.charAt(0).toUpperCase() : '?'}
            backgroundColor={theme.colors.primary}
          />
        </View>

        <View style={styles.infoSection}>
          <Text variant="headlineMedium" style={{ color: theme.colors.primary, marginBottom: 16 }}>
            {user.name}
          </Text>

          <View style={styles.infoRow}>
            <Text variant="titleMedium" style={styles.infoLabel}>Username:</Text>
            <Text variant="bodyLarge">{user.username}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="titleMedium" style={styles.infoLabel}>Email:</Text>
            <Text variant="bodyLarge">{user.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="titleMedium" style={styles.infoLabel}>Phone:</Text>
            <Text variant="bodyLarge">{user.phone || 'Not provided'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="titleMedium" style={styles.infoLabel}>Account Type:</Text>
            <Text variant="bodyLarge" style={{ textTransform: 'capitalize' }}>{user.role || 'User'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="titleMedium" style={styles.infoLabel}>Balance:</Text>
            {/* Format balance as currency, using toFixed(2) */}
            <Text variant="bodyLarge">${user.balance.toFixed(2)}</Text>
          </View>
        </View>
<View style={styles.balanceSection}>
  <Text variant="titleLarge" style={styles.balanceTitle}>Manage Balance</Text>
  <Divider style={styles.divider} />

  <TextInput
    label="Amount to Add ($)"
    value={amountToAdd}
    onChangeText={setAmountToAdd}
    keyboardType="numeric"
    mode="outlined" // Or "flat"
    style={styles.input}
    disabled={isLoading} // Disable input while loading
  />
  <PaperButton
    mode="contained"
    icon="plus-circle"
    onPress={handleAddBalance}
    loading={isLoading} // Show loading indicator on button
    disabled={isLoading || !amountToAdd} // Disable if loading or no amount entered
    style={styles.button} // Reuse existing button style or create new
  >
    Add Funds
  </PaperButton>
</View>
        <View style={styles.actionButtons}>
          <PaperButton
            mode="outlined"
            icon="account-edit"
            onPress={() => {
              // You can implement edit functionality later
              console.log('Edit profile pressed');
            }}
            style={[styles.button, { marginBottom: 12 }]}
          >
            Edit Profile
          </PaperButton>

          <PaperButton
            mode="contained"
            icon="logout"
            onPress={handleLogout}
            style={styles.button}
          >
            Logout
          </PaperButton>
        </View>
      </View>
    </ScrollView>
    // Add Snackbar at the bottom (outside ScrollView if possible, or at end of content)
    <Snackbar
      visible={snackbarVisible}
      onDismiss={() => setSnackbarVisible(false)}
      duration={Snackbar.DURATION_SHORT} // Or MEDIUM / LONG
    >
      {snackbarMessage}
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  infoSection: {
    width: '100%',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoLabel: {
    width: 100,
    fontWeight: 'bold',
  },
  actionButtons: {
    width: '100%',
    marginTop: 20,
  },
  button: {
    width: '100%',
  },
  balanceSection: {
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 10, // Adjust as needed
  },
  balanceTitle: {
    marginBottom: 8,
    textAlign: 'center',
    color: theme.colors.primary, // Use theme color
  },
  divider: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
});

export default ProfileScreen;

//// v1 version but not fetching user's info
// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
// import { useTheme, Text, Divider, Avatar } from 'react-native-paper';
// import { PaperButton } from '../components/paper';
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
//
// const API_URL = 'YOUR_API_BASE_URL'; // Replace with your actual API URL
//
// const ProfileScreen = () => {
//   const theme = useTheme();
//   const navigation = useNavigation();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//
//   // Fetch user profile data
//   const fetchUserProfile = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//
//       if (!token) {
//         setError('Not logged in');
//         setLoading(false);
//         return;
//       }
//
//       const response = await axios.get(`${API_URL}/users/profile`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//
//       setUser(response.data);
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching profile:', err);
//       setError('Failed to load profile');
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   // Load profile on component mount
//   useEffect(() => {
//     fetchUserProfile();
//   }, []);
//
//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.removeItem('userToken');
//       navigation.navigate('Login');
//     } catch (err) {
//       console.error('Error logging out:', err);
//     }
//   };
//
//   // Show loading state
//   if (loading) {
//     return (
//       <View style={[styles.container, styles.centerContent]}>
//         <ActivityIndicator size="large" color={theme.colors.primary} />
//         <Text style={{ marginTop: 16 }}>Loading profile...</Text>
//       </View>
//     );
//   }
//
//   // Show error state or not logged in
//   if (error || !user) {
//     return (
//       <View style={[styles.container, styles.centerContent]}>
//         <Text variant="bodyLarge" style={{ marginBottom: 16 }}>
//           {error || 'Please log in to view your profile'}
//         </Text>
//         <PaperButton
//           mode="contained"
//           onPress={() => navigation.navigate('Login')}
//         >
//           Go to Login
//         </PaperButton>
//       </View>
//     );
//   }
//
//   // Show user profile
//   return (
//     <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
//       <View style={styles.headerContainer}>
//         <Text
//           variant="headlineLarge"
//           style={[styles.title, { color: theme.colors.primary }]}
//         >
//           Profile
//         </Text>
//       </View>
//
//       <Divider />
//
//       <View style={styles.contentContainer}>
//         <View style={styles.avatarContainer}>
//           <Avatar.Text
//             size={80}
//             label={user.name ? user.name.charAt(0).toUpperCase() : '?'}
//             backgroundColor={theme.colors.primary}
//           />
//         </View>
//
//         <View style={styles.infoSection}>
//           <Text variant="headlineMedium" style={{ color: theme.colors.primary, marginBottom: 16 }}>
//             {user.name}
//           </Text>
//
//           <View style={styles.infoRow}>
//             <Text variant="titleMedium" style={styles.infoLabel}>Username:</Text>
//             <Text variant="bodyLarge">{user.username}</Text>
//           </View>
//
//           <View style={styles.infoRow}>
//             <Text variant="titleMedium" style={styles.infoLabel}>Email:</Text>
//             <Text variant="bodyLarge">{user.email}</Text>
//           </View>
//
//           <View style={styles.infoRow}>
//             <Text variant="titleMedium" style={styles.infoLabel}>Phone:</Text>
//             <Text variant="bodyLarge">{user.phone || 'Not provided'}</Text>
//           </View>
//
//           <View style={styles.infoRow}>
//             <Text variant="titleMedium" style={styles.infoLabel}>Account Type:</Text>
//             <Text variant="bodyLarge" style={{ textTransform: 'capitalize' }}>{user.role || 'User'}</Text>
//           </View>
//         </View>
//
//         <View style={styles.actionButtons}>
//           <PaperButton
//             mode="outlined"
//             icon="account-edit"
//             onPress={() => {/* Navigate to edit profile screen */}}
//             style={[styles.button, { marginBottom: 12 }]}
//           >
//             Edit Profile
//           </PaperButton>
//
//           <PaperButton
//             mode="contained"
//             icon="logout"
//             onPress={handleLogout}
//             style={styles.button}
//           >
//             Logout
//           </PaperButton>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   centerContent: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     flex: 1,
//     textAlign: 'left',
//   },
//   contentContainer: {
//     flex: 1,
//     alignItems: 'center',
//     padding: 20,
//   },
//   avatarContainer: {
//     marginVertical: 20,
//     alignItems: 'center',
//   },
//   infoSection: {
//     width: '100%',
//     marginBottom: 24,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     marginBottom: 12,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   infoLabel: {
//     width: 100,
//     fontWeight: 'bold',
//   },
//   actionButtons: {
//     width: '100%',
//     marginTop: 20,
//   },
//   button: {
//     width: '100%',
//   },
// });
//
// export default ProfileScreen;


//// PLACEHOLDER VERSION
// import React from 'react';
// import { View, StyleSheet } from 'react-native';
// import { useTheme, Text, Divider } from 'react-native-paper';
// import { PaperButton } from '../components/paper';
// import { useNavigation } from '@react-navigation/native';
//
// const ProfileScreen: React.FC = () => {
//   const theme = useTheme();
//   const navigation = useNavigation();
//
//   return (
//     <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
//       <View style={styles.headerContainer}>
//         <Text
//           variant="headlineLarge"
//           style={[styles.title, { color: theme.colors.primary }]}
//         >
//           Profile
//         </Text>
//       </View>
//
//       <Divider />
//
//       <View style={styles.contentContainer}>
//         <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
//           Profile Screen
//         </Text>
//         <Text variant="bodyLarge" style={styles.placeholderText}>
//           profile coming soon!
//         </Text>
//         <PaperButton
//           mode="contained"
//           onPress={() => navigation.navigate('Login')}
//           style={styles.logoutButton}
//         >
//           Logout
//         </PaperButton>
//       </View>
//     </View>
//   );
// };
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     flex: 1,
//     textAlign: 'left',
//   },
//   contentContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   placeholderText: {
//     textAlign: 'center',
//     marginVertical: 16,
//   },
//   logoutButton: {
//     // Add styles for the logout button here
//   },
// });
//
// export default ProfileScreen;