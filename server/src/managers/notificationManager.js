const Notification = require("../models/Notification");
const mongoose = require("mongoose");

exports.getAllNotRead = async (userId) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const notifications = await Notification.find({
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: sevenDaysAgo },
        isRead: false, 
    }).sort({ timestamp: -1 }); // sort by latest first

    return notifications;
};
