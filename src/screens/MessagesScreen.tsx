// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { useTheme, Text, Divider, SegmentedButtons, Avatar } from 'react-native-paper';
// import { useNavigation } from '@react-navigation/native';
// import { useAppContext } from '../contexts/AppContext';
// import { PaperButton } from '../components/paper'; // Assuming you have PaperButton

// const MessagesScreen: React.FC = () => {
//     const theme = useTheme();
//     const navigation = useNavigation();
//     const { state } = useAppContext();
//     const { isAuthenticated, user } = state.auth;
//     const [activeTab, setActiveTab] = useState('messages');
//     const [conversations, setConversations] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // useEffect(() => {
//     //     if (isAuthenticated && activeTab === 'messages') {
//     //         fetchConversations();
//     //     }
//     // }, [activeTab, isAuthenticated]);

//     // const fetchConversations = async () => {
//     //     setLoading(true);
//     //     setError(null);
//     //     try {
//     //         const token = state.auth.token; // Get token from AppContext
//     //         if (!token) {
//     //             // setError('Authentication token not found.');
//     //             // setLoading(false);
//     //             return;
//     //         }

//     //         const response = await fetch('http://localhost:3000/api/messages/conversations', {
//     //             headers: {
//     //                 'Authorization': `Bearer ${token}`,
//     //             },
//     //         });

//     //         if (!response.ok) {
//     //             const errorData = await response.json();
//     //             setError(errorData.message || 'Failed to fetch conversations.');
//     //         } else {
//     //             const data = await response.json();
//     //             setConversations(data);
//     //         }
//     //     } catch (err) {
//     //         // setError('An unexpected error occurred.');
//     //     } finally {
//     //         setLoading(false);
//     //     }
//     // };

//     // const renderConversationItem = ({ item }) => (
//     //     <TouchableOpacity
//     //         style={styles.conversationItem}
//     //         onPress={() => {
//     //             navigation.navigate('Chat', { otherUsername: item.otherUser.username });
//     //         }}
//     //     >
//     //         <Avatar.Text
//     //             size={40}
//     //             label={item.otherUser.username.substring(0, 2).toUpperCase()}
//     //             style={{ backgroundColor: theme.colors.secondary }}
//     //         />
//     //         <View style={styles.conversationDetails}>
//     //             <Text style={{ fontWeight: 'bold' }}>{item.otherUser.username}</Text>
//     //             <Text style={{ color: 'gray' }} numberOfLines={1}>{item.lastMessage}</Text>
//     //         </View>
//     //         <Text style={{ color: 'gray', fontSize: 12 }}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
//     //     </TouchableOpacity>
//     // );

//     // if (!isAuthenticated) {
//     //     return (
//     //         <View style={[styles.container, styles.centerContent]}>
//     //             <Text variant="bodyLarge" style={{ marginBottom: 16 }}>
//     //                 Please log in to view your messages
//     //             </Text>
//     //             <PaperButton
//     //                 mode="contained"
//     //                 onPress={() => navigation.navigate('Login')}
//     //             >
//     //                 Go to Login
//     //             </PaperButton>
//     //         </View>
//     //     );
//     // }

//     return (
//         <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
//             <View style={styles.headerContainer}>
//                 <Text
//                     variant="headlineLarge"
//                     style={[styles.title, { color: theme.colors.primary }]}
//                 >
//                     Messages
//                 </Text>
//             </View>

//             <Divider />

//             {/* Tab Filter */}
//             <View style={styles.tabContainer}>
//                 <SegmentedButtons
//                     value={activeTab}
//                     onValueChange={setActiveTab}
//                     buttons={[
//                         {
//                             value: 'messages',
//                             label: 'Messages',
//                         },
//                         {
//                             value: 'notifications',
//                             label: 'Notifications',
//                         },
//                     ]}
//                     style={styles.segmentedButtons}
//                 />
//             </View>

//             <View style={styles.contentContainer}>
//                 {activeTab === 'messages' ? (
//                     loading ? (
//                         <View style={styles.centerContent}>
//                             <ActivityIndicator size="large" color={theme.colors.primary} />
//                         </View>
//                     ) : error ? (
//                         <View style={styles.centerContent}>
//                             <Text style={{ color: 'red' }}>Error: {error}</Text>
//                         </View>
//                     ) : conversations.length > 0 ? (
//                         <FlatList
//                             data={conversations}
//                             keyExtractor={(item, index) => index.toString()}
//                             renderItem={renderConversationItem}
//                             style={{ flex: 1, width: '100%' }}
//                             contentContainerStyle={{ paddingBottom: 20 }}
//                         />
//                     ) : (
//                         <View style={styles.centerContent}>
//                             <Text style={styles.placeholderText}>No conversations yet. Start a new one!</Text>
//                         </View>
//                     )
//                 ) : (
//                     <View style={styles.centerContent}>
//                         <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
//                             Notifications
//                         </Text>
//                         <Text variant="bodyLarge" style={styles.placeholderText}>
//                             notifications coming soon!
//                         </Text>
//                     </View>
//                 )}
//             </View>

//             {activeTab === 'messages' && isAuthenticated && (
//                 <TouchableOpacity
//                     style={styles.newConversationButton}
//                     onPress={() => {
//                         navigation.navigate('NewConversation');
//                     }}
//                 >
//                     <Text style={{ color: 'white', fontSize: 24 }}>+</Text>
//                 </TouchableOpacity>
//             )}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     headerContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         padding: 20,
//     },
//     title: {
//         flex: 1,
//         textAlign: 'left',
//     },
//     tabContainer: {
//         paddingHorizontal: 20,
//         paddingVertical: 12,
//     },
//     segmentedButtons: {
//         backgroundColor: 'transparent',
//     },
//     contentContainer: {
//         flex: 1,
//         padding: 20,
//     },
//     centerContent: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     placeholderText: {
//         textAlign: 'center',
//         marginVertical: 16,
//     },
//     conversationItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 12,
//         paddingHorizontal: 16,
//         borderBottomWidth: 1,
//         borderBottomColor: '#eee',
//     },
//     conversationDetails: {
//         marginLeft: 16,
//         flex: 1,
//     },
//     newConversationButton: {
//         position: 'absolute',
//         bottom: 20,
//         right: 20,
//         backgroundColor: theme.colors.primary,
//         borderRadius: 30,
//         width: 60,
//         height: 60,
//         justifyContent: 'center',
//         alignItems: 'center',
//         elevation: 5,
//     },
// });

// export default MessagesScreen;


// ORIGINAL:

// import React, { useState } from 'react';
// import { View, StyleSheet } from 'react-native';
// import { useTheme, Text, Divider, SegmentedButtons } from 'react-native-paper';

// const MessagesScreen: React.FC = () => {
//   const theme = useTheme();
//   const [activeTab, setActiveTab] = useState('messages');

//   return (
//     <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
//       <View style={styles.headerContainer}>
//         <Text
//           variant="headlineLarge"
//           style={[styles.title, { color: theme.colors.primary }]}
//         >
//           Messages
//         </Text>
//       </View>

//       <Divider />
      
//       {/* Tab Filter */}
//       <View style={styles.tabContainer}>
//         <SegmentedButtons
//           value={activeTab}
//           onValueChange={setActiveTab}
//           buttons={[
//             {
//               value: 'messages',
//               label: 'Messages',
//             },
//             {
//               value: 'notifications',
//               label: 'Notifications',
//             },
//           ]}
//           style={styles.segmentedButtons}
//         />
//       </View>

//       <View style={styles.contentContainer}>
//         {activeTab === 'messages' ? (
//           <>
//             <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
//               Messages
//             </Text>
//             <Text variant="bodyLarge" style={styles.placeholderText}>
//               messages coming soon!
//             </Text>
//           </>
//         ) : (
//           <>
//             <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
//               Notifications
//             </Text>
//             <Text variant="bodyLarge" style={styles.placeholderText}>
//               notifications coming soon!
//             </Text>
//           </>
//         )}
//       </View>
//     </View>
//   );
// };

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
//   tabContainer: {
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//   },
//   segmentedButtons: {
//     backgroundColor: 'transparent',
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
// });

// export default MessagesScreen;










// // THIS IS WORKING RIGHT NOW:






// import React, { useState, useEffect, useCallback } from 'react';
// import { View, StyleSheet, FlatList, Pressable } from 'react-native';
// import { useTheme, Text, Divider, SegmentedButtons, List, Avatar, ActivityIndicator } from 'react-native-paper';
// import { useFocusEffect, useNavigation } from '@react-navigation/native'; // Import useFocusEffect and useNavigation
// import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // For navigation prop typing

// import { useAppContext } from '../contexts/AppContext'; // Adjust path if needed
// import MessagingService from '../services/MessagingService'; // Adjust path if needed
// import { formatDistanceToNow } from 'date-fns'; // For formatting timestamps

// // Define Conversation type based on backend response
// interface Conversation {
//   otherUser: {
//     _id: string;
//     username: string;
//     // Add other user fields if populated and needed (e.g., name)
//   };
//   lastMessage: string;
//   timestamp: string; // ISO date string
// }

// // Define type for navigation stack parameters (adjust 'Chat' screen name if different)
// type RootStackParamList = {
//   Messages: undefined; // Assuming MessagesScreen is part of a stack
//   Chat: { recipientUsername: string; recipientId: string }; // Parameters for the chat screen
//   // Add other screens in your stack here
// };

// type MessagesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Messages'>;


// const MessagesScreen: React.FC = () => {
//   const theme = useTheme();
//   const { state } = useAppContext(); // Get state from context
//   const navigation = useNavigation<MessagesScreenNavigationProp>(); // Hook for navigation
//   const [activeTab, setActiveTab] = useState('messages');
//   const [conversations, setConversations] = useState<Conversation[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const loadConversations = useCallback(async () => {
//     if (!state.auth.isAuthenticated) {
//       setError("Please log in to view messages.");
//       setConversations([]); // Clear conversations if not authenticated
//       return;
//     }

//     setIsLoading(true);
//     setError(null); // Clear previous errors

//     try {
//       const fetchedConversations = await MessagingService.fetchConversations();
//       setConversations(fetchedConversations);
//     } catch (err: any) {
//       setError(err.message || 'Failed to load conversations.');
//       setConversations([]); // Clear conversations on error
//     } finally {
//       setIsLoading(false);
//     }
//   }, [state.auth.isAuthenticated]); // Dependency: refetch if auth state changes

//   // Use useFocusEffect to reload data when the screen comes into focus
//   useFocusEffect(
//     useCallback(() => {
//       if (activeTab === 'messages') {
//         loadConversations();
//       }
//       // Return a cleanup function if needed, though not strictly necessary for this fetch
//       // return () => console.log('MessagesScreen unfocused');
//     }, [activeTab, loadConversations]) // Dependencies: reload if tab or fetch function changes
//   );

//   const handleConversationPress = (item: Conversation) => {
//      navigation.navigate('Chat', { // Navigate to Chat screen
//        recipientUsername: item.otherUser.username,
//        recipientId: item.otherUser._id, // Pass recipient ID as well
//      });
//   };

//   const renderConversationItem = ({ item }: { item: Conversation }) => (
//     <List.Item
//       title={item.otherUser.username}
//       description={item.lastMessage}
//       descriptionNumberOfLines={1} // Prevent long messages from taking too much space
//       left={props => <Avatar.Text {...props} size={48} label={item.otherUser.username.substring(0, 2).toUpperCase()} />}
//       right={() => (
//          <Text variant="bodySmall" style={styles.timestamp}>
//              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
//          </Text>
//       )}
//       onPress={() => handleConversationPress(item)} // Add onPress handler
//       style={styles.listItem}
//     />
//   );

//   const renderContent = () => {
//     if (activeTab === 'notifications') {
//       return (
//         <>
//           <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
//             Notifications
//           </Text>
//           <Text variant="bodyLarge" style={styles.placeholderText}>
//             Notifications coming soon!
//           </Text>
//         </>
//       );
//     }

//     // Messages Tab Content
//     if (!state.auth.isAuthenticated) {
//          return <Text style={styles.placeholderText}>{error || "Please log in."}</Text>;
//     }

//     if (isLoading) {
//       return <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />;
//     }

//     if (error) {
//       return <Text style={[styles.placeholderText, { color: theme.colors.error }]}>{error}</Text>;
//     }

//     if (conversations.length === 0) {
//       return <Text style={styles.placeholderText}>No conversations yet.</Text>;
//     }

//     return (
//        <FlatList
//             data={conversations}
//             keyExtractor={(item) => item.otherUser._id} // Use user ID as key
//             renderItem={renderConversationItem}
//             ItemSeparatorComponent={() => <Divider style={styles.divider} />} // Add dividers between items
//             style={styles.list}
//        />
//     );
//   };


//   return (
//     <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
//       <View style={styles.headerContainer}>
//         <Text
//           variant="headlineLarge"
//           style={[styles.title, { color: theme.colors.primary }]}
//         >
//           Messages
//         </Text>
//       </View>

//       <Divider />

//       {/* Tab Filter */}
//       <View style={styles.tabContainer}>
//         <SegmentedButtons
//           value={activeTab}
//           onValueChange={setActiveTab}
//           buttons={[
//             { value: 'messages', label: 'Messages' },
//             { value: 'notifications', label: 'Notifications' },
//           ]}
//           style={styles.segmentedButtons}
//         />
//       </View>

//       {/* Conditionally render content based on tab and loading/error states */}
//       <View style={styles.contentContainer}>
//         {renderContent()}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingTop: 20, // Adjust padding as needed
//     paddingBottom: 10,
//   },
//   title: {
//     flex: 1,
//     textAlign: 'left',
//     fontWeight: 'bold', // Make title bolder
//   },
//   tabContainer: {
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//   },
//   segmentedButtons: {
//     // backgroundColor: 'transparent', // Keep or adjust based on theme
//   },
//   contentContainer: {
//     flex: 1,
//     // Remove centering if using FlatList
//     // justifyContent: 'center',
//     // alignItems: 'center',
//     paddingHorizontal: 0, // No horizontal padding for list items to span full width
//   },
//   placeholderText: {
//     textAlign: 'center',
//     marginVertical: 16,
//     paddingHorizontal: 20, // Add padding back for placeholder text
//     fontSize: 16,
//     color: '#666', // Softer color for placeholders
//   },
//   list: {
//       flex: 1,
//       width: '100%', // Ensure list takes full width
//   },
//   listItem: {
//       paddingHorizontal: 20, // Add horizontal padding to list items
//       paddingVertical: 10, // Add vertical padding
//       backgroundColor: 'transparent', // Ensure item background is transparent or matches theme
//   },
//   timestamp: {
//      alignSelf: 'center', // Center timestamp vertically
//      fontSize: 12,
//      color: '#888', // Softer color for timestamp
//      marginLeft: 10, // Add some space if needed
//   },
//   divider: {
//       // Optional: style the divider if needed
//       // height: 1,
//       // backgroundColor: '#e0e0e0',
//   }
// });

// export default MessagesScreen;






//ADDING NEW MESSAGE BUTTON:

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native'; // Removed Pressable as List.Item has onPress
import { useTheme, Text, Divider, SegmentedButtons, List, Avatar, ActivityIndicator, IconButton } from 'react-native-paper'; // <-- Import IconButton
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppContext } from '../contexts/AppContext';
import MessagingService from '../services/MessagingService';
import { formatDistanceToNow } from 'date-fns';

// Define Conversation type
interface Conversation {
  otherUser: {
    _id: string;
    username: string;
  };
  lastMessage: string;
  timestamp: string;
}

// --- Define type for navigation stack parameters ---
// *** ADD SelectRecipient HERE ***
type RootStackParamList = {
  Messages: undefined;
  Chat: { recipientUsername: string; recipientId: string };
  SelectRecipient: undefined; // <-- Add the new screen here
  // Add other screens in your stack here
};

type MessagesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Messages'>;


const MessagesScreen: React.FC = () => {
  const theme = useTheme();
  const { state } = useAppContext();
  const navigation = useNavigation<MessagesScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    // ... (keep existing loadConversations function)
        if (!state.auth.isAuthenticated) {
      setError("Please log in to view messages.");
      setConversations([]); // Clear conversations if not authenticated
      return;
    }

    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      const fetchedConversations = await MessagingService.fetchConversations();
      setConversations(fetchedConversations);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations.');
      setConversations([]); // Clear conversations on error
    } finally {
      setIsLoading(false);
    }
  }, [state.auth.isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
    // ... (keep existing useFocusEffect)
         if (activeTab === 'messages') {
        loadConversations();
      }
    }, [activeTab, loadConversations])
  );

  const handleConversationPress = (item: Conversation) => {
    // ... (keep existing handleConversationPress function)
       navigation.navigate('Chat', {
      recipientUsername: item.otherUser.username,
      recipientId: item.otherUser._id,
    });
  };

  // --- Add handler for the new message button ---
  const handleNewMessagePress = () => {
    navigation.navigate('SelectRecipient'); // Navigate to the new screen
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    // ... (keep existing renderConversationItem function)
    <List.Item
      title={item.otherUser.username}
      description={item.lastMessage}
      descriptionNumberOfLines={1}
      left={props => <Avatar.Text {...props} size={48} label={item.otherUser.username.substring(0, 2).toUpperCase()} />}
      right={() => (
        <Text variant="bodySmall" style={styles.timestamp}>
            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
        </Text>
      )}
      onPress={() => handleConversationPress(item)}
      style={styles.listItem}
    />
  );

  const renderContent = () => {
     // ... (keep existing renderContent function)
     if (activeTab === 'notifications') {
      return (
        <>
          
          <Text variant="bodyLarge" style={styles.placeholderText}>
            Notifications coming soon!
          </Text>
        </>
      );
    }

    if (!state.auth.isAuthenticated) {
        return <Text style={styles.placeholderText}>{error || "Please log in."}</Text>;
    }

    if (isLoading) {
      return <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />;
    }

    if (error) {
      return <Text style={[styles.placeholderText, { color: theme.colors.error }]}>{error}</Text>;
    }

    if (conversations.length === 0) {
      return <Text style={styles.placeholderText}>No conversations yet.</Text>;
    }

    return (
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.otherUser._id}
        renderItem={renderConversationItem}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        style={styles.list}
      />
    );
  };


  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <Text
          variant="headlineLarge"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Messages
        </Text>
        {/* --- Add the New Message Button --- */}
        <IconButton
            icon="plus-circle-outline" // Or "pencil-plus-outline", "message-plus-outline" etc.
            size={28}
            iconColor={theme.colors.primary}
            onPress={handleNewMessagePress}
        />
      </View>

      <Divider />

      <View style={styles.tabContainer}>
       {/* ... (keep existing SegmentedButtons) */}
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'messages', label: 'Messages' },
            { value: 'notifications', label: 'Notifications' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </View>
  );
};

// --- Adjust styles if necessary ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Ensures title is left and button is right
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    // flex: 1, // Removed flex: 1 to allow button to take its space
    textAlign: 'left',
    fontWeight: 'bold',
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  segmentedButtons: {},
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  placeholderText: {
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#666',
  },
  list: {
      flex: 1,
      width: '100%',
  },
  listItem: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: 'transparent',
  },
  timestamp: {
      alignSelf: 'center',
      fontSize: 12,
      color: '#888',
      marginLeft: 10,
  },
  divider: {},
});

export default MessagesScreen;





