const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        household: {
            type: mongoose.Types.ObjectId,
            ref: "Household",
            required: true,
        },
        sender: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
        },
        img: {
            type: String,
        },
        // resourceType: {
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
