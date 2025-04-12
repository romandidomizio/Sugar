import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme, Text, Divider, Avatar } from 'react-native-paper';
import { PaperButton } from '../components/paper';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../contexts/AppContext';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../services/AuthService';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { state, logout, uploadProfilePhoto } = useAppContext();
  const { user, isAuthenticated } = state.auth;
  const [uploading, setUploading] = useState(false);

  // Request permission to access the camera roll
  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        return false;
      }
      return true;
    }
    return true;
  };

  // Pick an image from the gallery
  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        uploadUserPhoto(selectedImage.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Upload the selected image
  const uploadUserPhoto = async (photoUri: string) => {
    setUploading(true);
    try {
      console.log('Uploading photo from:', photoUri);
      const response = await uploadProfilePhoto(photoUri);
      console.log('Upload response:', response);

      if (response && response.success) {
        Alert.alert('Success', 'Profile photo updated successfully');
        // If needed, update local state to show the new image
        // You might need to refresh user data here
      } else {
        Alert.alert('Error', 'Failed to update profile photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo: ' + (error.toString ? error.toString() : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };
//   const uploadUserPhoto = async (photoUri: string) => {
//     setUploading(true);
//     try {
//       const success = await uploadProfilePhoto(photoUri);
//       if (success) {
//         Alert.alert('Success', 'Profile photo updated successfully');
//       } else {
//         Alert.alert('Error', 'Failed to update profile photo');
//       }
//     } catch (error) {
//       console.error('Error uploading photo:', error);
//       Alert.alert('Error', 'Failed to upload photo');
//     } finally {
//       setUploading(false);
//     }
//   };

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login');
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

  // Get the full photo URL if the user has a photo
  const photoUrl = user.photo ?
    (user.photo.startsWith('http') ? user.photo : `${API_URL}${user.photo}`) :
    null;

  // Show user profile
  return (
        <View style={styles.container}>
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            <Avatar.Image
              size={120}
              source={
                user?.photo
                  ? { uri: user.photo }
                  : require('../assets/default-avatar.png')
              }
            />
            {uploading && <ActivityIndicator size="small" color={theme.colors.primary} />}
          </TouchableOpacity>

          <Text style={styles.username}>{user?.username || 'User'}</Text>

          {/* Rest of your profile screen */}
        </View>
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
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={pickImage}
          disabled={uploading}
        >
          {photoUrl ? (
            <Avatar.Image
              size={100}
              source={{ uri: photoUrl }}
            />
          ) : (
            <Avatar.Text
              size={100}
              label={user.name ? user.name.charAt(0).toUpperCase() : '?'}
              backgroundColor={theme.colors.primary}
            />
          )}
          <Text style={styles.changePhotoText}>
            {uploading ? 'Uploading...' : 'Tap to change photo'}
          </Text>
        </TouchableOpacity>

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
  changePhotoText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
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
});

export default ProfileScreen;

////this version fetches all of the user's info, but no profile photo upload
// import React, { useEffect } from 'react';
// import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
// import { useTheme, Text, Divider, Avatar } from 'react-native-paper';
// import { PaperButton } from '../components/paper';
// import { useNavigation } from '@react-navigation/native';
// import { useAppContext } from '../contexts/AppContext';
//
// const ProfileScreen: React.FC = () => {
//   const theme = useTheme();
//   const navigation = useNavigation();
//   const { state, logout } = useAppContext();
//   const { user, isAuthenticated } = state.auth;
//
//   const handleLogout = async () => {
//     await logout();
//     navigation.navigate('Login');
//   };
//
//   // If not authenticated
//   if (!isAuthenticated || !user) {
//     return (
//       <View style={[styles.container, styles.centerContent]}>
//         <Text variant="bodyLarge" style={{ marginBottom: 16 }}>
//           Please log in to view your profile
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
//             onPress={() => {
//               // You can implement edit functionality later
//               console.log('Edit profile pressed');
//             }}
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