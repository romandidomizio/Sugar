import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Appbar, TextInput, Button, ActivityIndicator } from 'react-native-paper'; // Import necessary components
import { useAppContext } from '../contexts/AppContext'; // Import context if needed for user info
import MessagingService from '../services/MessagingService'; // Import the service

// Define type for navigation stack parameters (must match MessagesScreen)
type RootStackParamList = {
  Messages: undefined;
  Chat: { recipientUsername: string; recipientId: string };
  // Add other screens in your stack here
};

// Define the type for the route prop specific to this screen
type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Message {
    _id: string;
    sender: { _id: string; username: string };
    recipient: { _id: string; username: string };
    content: string;
    timestamp: string;
    read: boolean;
}

const ChatScreen: React.FC = ({ navigation }: any) => { // Add navigation prop if needed
  const route = useRoute<ChatScreenRouteProp>();
  const { recipientUsername, recipientId } = route.params; // Get parameters passed from navigation
  const { state } = useAppContext(); // Get logged-in user info if needed

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

   // --- Fetch Message History ---
   const loadMessages = useCallback(async () => {
       setIsLoading(true);
       setError(null);
       try {
           const history = await MessagingService.fetchMessageHistory(recipientUsername);
           setMessages(history);
       } catch (err: any) {
           setError(err.message || 'Failed to load messages.');
       } finally {
           setIsLoading(false);
       }
   }, [recipientUsername]);

   useEffect(() => {
       loadMessages();
       // Optional: Add polling or WebSocket connection here for real-time updates
   }, [loadMessages]);

   // --- Send Message ---
   const handleSend = async () => {
       if (!newMessage.trim() || isSending) return;

       setIsSending(true);
       setError(null);
       try {
           const sentMessage = await MessagingService.sendMessage(recipientUsername, newMessage);
           setMessages(prevMessages => [...prevMessages, sentMessage]); // Optimistically add message
           setNewMessage(''); // Clear input
       } catch (err: any) {
           setError(err.message || 'Failed to send message.');
           // Optional: Remove optimistic update on failure if desired
       } finally {
           setIsSending(false);
       }
   };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={recipientUsername} />
      </Appbar.Header>
      <View style={styles.messagesContainer}>
        {/* TODO: Render messages using FlatList */}
         {isLoading && <ActivityIndicator style={styles.center} />}
         {error && <Text style={[styles.center, styles.errorText]}>{error}</Text>}
         {!isLoading && !error && messages.length === 0 && (
            <Text style={styles.center}>No messages yet. Start the conversation!</Text>
         )}
         {/* Placeholder for actual message list */}
         {!isLoading && !error && messages.map(msg => (
             <Text key={msg._id} style={msg.sender.username === state.auth.user?.username ? styles.myMessage : styles.theirMessage}>
                 {msg.content}
             </Text>
         ))}
      </View>
      <View style={styles.inputContainer}>
         <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            mode="outlined"
            dense
         />
         <Button
            mode="contained"
            onPress={handleSend}
            loading={isSending}
            disabled={isSending || !newMessage.trim()}
            style={styles.sendButton}
         >
             Send
         </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
        padding: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        marginRight: 10,
    },
    sendButton: {
        // Add styling if needed
    },
    center: {
        flex: 1,
        textAlign: 'center',
        textAlignVertical: 'center',
        color: '#888',
    },
    errorText: {
        color: 'red',
    },
    // Basic message styling (replace with proper chat bubbles)
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6', // Example background
        padding: 8,
        borderRadius: 8,
        marginVertical: 4,
        maxWidth: '80%',
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF', // Example background
        padding: 8,
        borderRadius: 8,
        marginVertical: 4,
        maxWidth: '80%',
        borderWidth: 1,
        borderColor: '#eee'
    }
});

export default ChatScreen;