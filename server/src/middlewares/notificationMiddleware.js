const mongoose = require('mongoose');
const Notification = require('../models/Notification');

const getNotification = async (req, res, next) => {
    const notificationId = req.params.notificationId;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return res.status(404).json({ message: 'Invalid notification ID format' });
    }

    try {
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        req.notificationId = notificationId;

        next();
    } catch (error) {
        console.error('Error fetching notification:', error);
        return res.status(500).json({ message: 'Error fetching notification' });
    }
}

module.exports = getNotification;