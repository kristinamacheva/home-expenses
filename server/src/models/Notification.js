const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: { type: String, required: true },
    resourceType: { type: String, required: false }, // Optional
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: false }, // Optional
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
