const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User'); // Import the User model

// Route 1: Send a message
router.get('/', (req, res) => {
    res.send('Messaging API is live!');
});
router.post('/send', async (req, res) => {
    try {
        const { senderUsername, recipientUsername, content } = req.body;

        console.log("Received request:", { senderUsername, recipientUsername, content });

        // Check if request body contains all required fields
        if (!senderUsername || !recipientUsername || !content) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Find sender by username
        const sender = await User.findOne({ username: senderUsername });
        if (!sender) {
            console.error("Sender not found:", senderUsername);
            return res.status(404).json({ error: "Sender not found" });
        }

        // Find recipient by username
        const recipient = await User.findOne({ username: recipientUsername });
        if (!recipient) {
            console.error("Recipient not found:", recipientUsername);
            return res.status(404).json({ error: "Recipient not found" });
        }

        // Create and save the message
        const message = new Message({
            sender: sender._id,
            recipient: recipient._id,
            content
        });
        await message.save();

        console.log("Message saved successfully:", message);
        res.status(201).json({ message: 'Message sent successfully!', data: message });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:senderUsername/:recipientUsername', async (req, res) => {
    try {
        const { senderUsername, recipientUsername } = req.params;

        // Find sender and recipient by their usernames
        const sender = await User.findOne({ username: senderUsername });
        const recipient = await User.findOne({ username: recipientUsername });

        if (!sender || !recipient) {
            return res.status(404).json({ message: 'Sender or recipient not found' });
        }

        // Fetch message history using sender and recipient IDs
        const messages = await Message.find({
            $or: [
                { sender: sender._id, recipient: recipient._id },
                { sender: recipient._id, recipient: sender._id }
            ]
        })
            .populate('sender', 'username') // Populate sender's username
            .populate('recipient', 'username') // Populate recipient's username
            .sort({ timestamp: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching message history:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route 2: Get message history between two users
router.get('/:user1/:user2', async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: user1, recipient: user2 },
                { sender: user2, recipient: user1 }
            ]
        }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching message history:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route 3: Mark messages as read
router.patch('/mark-read', async (req, res) => {
    try {
        const { recipient, sender } = req.body;
        const result = await Message.updateMany(
            { recipient, sender, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ message: 'Messages marked as read!', data: result });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;