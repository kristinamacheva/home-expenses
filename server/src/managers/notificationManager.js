const Notification = require("../models/Notification");
const mongoose = require("mongoose");

exports.getAllNotRead = async (userId) => {
    // Fetch the last 20 notifications for the user
    const notifications = await Notification.find({
        user: new mongoose.Types.ObjectId(userId),
    })
        .sort({ timestamp: -1 }) // sort by latest first
        .limit(20);

    // If there are more than 20 notifications, delete the older ones
    if (notifications.length === 20) {
        const lastNotificationDate = notifications[19].timestamp;

        await Notification.deleteMany({
            user: new mongoose.Types.ObjectId(userId),
            timestamp: { $lt: lastNotificationDate },
        });
    }

    return notifications;
};

exports.delete = async (notificationId) => {
    await Notification.findByIdAndDelete(notificationId);
};
