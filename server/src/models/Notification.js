const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: { type: String, required: true },
    resourceType: {
        type: String,
        enum: ['PaidExpense', 'Payment', 'Category', 'HouseholdInvitation', 'Allowance', 'Reminder'], 
    },
    resourceId: {
        type: mongoose.Types.ObjectId,
        refPath: 'resourceType', // Dynamic reference
    },
    household: {
        type: mongoose.Types.ObjectId,
        ref: "Household",
        required: true,
    },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
