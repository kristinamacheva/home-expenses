const mongoose = require('mongoose');
const Message = require('../models/Message');

const getMessage = async (req, res, next) => {
    const messageId = req.params.messageId;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
        return res.status(404).json({ message: 'Invalid message ID format' });
    }

    try {
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        req.messageId = messageId;

        next();
    } catch (error) {
        console.error('Error fetching message:', error);
        return res.status(500).json({ message: 'Error fetching message' });
    }
}

module.exports = getMessage;