// src/services/MessagingService.js
import AuthService from './AuthService'; // Assuming AuthService handles token retrieval and base URL

const API_BASE_URL = 'http://localhost:3000/api'; // Replace with your actual API base URL (e.g., http://localhost:3000/api)

const MessagingService = {
    fetchConversations: async () => {
        const token = await AuthService.getToken();
        if (!token) {
            throw new Error('Authentication token not found.');
        }

        try {
            const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data; // Should be an array of conversation objects
        } catch (error) {
            console.error("Error fetching conversations:", error);
            throw error; // Re-throw the error to be caught by the component
        }
    },

    // Add other messaging API calls here later (e.g., fetchMessageHistory, sendMessage)
    fetchMessageHistory: async (otherUsername) => {
        const token = await AuthService.getToken();
        const currentUser = await AuthService.fetchUserProfile(); // Need current user's username

        if (!token || !currentUser || !currentUser.username) {
             throw new Error('User or token not found.');
        }

         try {
            const response = await fetch(`${API_BASE_URL}/messages/${currentUser.username}/${otherUsername}`, {
                method: 'GET',
                 headers: {
                     'Authorization': `Bearer ${token}`,
                 },
            });

             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
             }

             const data = await response.json();
             return data; // Array of messages
         } catch (error) {
             console.error("Error fetching message history:", error);
             throw error;
         }
    },

     sendMessage: async (recipientUsername, content) => {
         const token = await AuthService.getToken();
         const currentUser = await AuthService.fetchUserProfile(); // Need current user's username

         if (!token || !currentUser || !currentUser.username) {
             throw new Error('User or token not found.');
         }

         try {
             const response = await fetch(`${API_BASE_URL}/messages/send`, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                     'Authorization': `Bearer ${token}`,
                 },
                 body: JSON.stringify({
                     senderUsername: currentUser.username,
                     recipientUsername: recipientUsername,
                     content: content,
                 }),
             });

             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
             }

             const data = await response.json();
             return data.data; // Return the sent message object
         } catch (error) {
             console.error("Error sending message:", error);
             throw error;
         }
     },
};

export default MessagingService;