const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now // Automatically adds the current date and time
    },
    read: {
        type: Boolean,
        default: false // Defaults to unread
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create the Message model
const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;