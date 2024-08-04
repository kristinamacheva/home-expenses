const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        resourceType: {
            type: String,
            enum: ["PaidExpense", "Payment"],
            required: false,
        },
        resourceId: {
            type: mongoose.Types.ObjectId,
            refPath: "resourceType", // Dynamic reference
            required: false,
        },
        household: {
            type: mongoose.Types.ObjectId,
            ref: "Household",
            required: true,
        },
    },
    { timestamps: true }
);

const Reminder = mongoose.model("Reminder", reminderSchema);

module.exports = Reminder;
