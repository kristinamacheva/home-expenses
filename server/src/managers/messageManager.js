const Household = require("../models/Household");
const { AppError } = require("../utils/AppError");
const { default: mongoose } = require("mongoose");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const PaidExpense = require("../models/PaidExpense");
const Message = require("../models/Message");
const User = require("../models/User");
const ALLOWED_ORIGINS = require("../constants/constants");
const { sendNotificationToUser, sendMessageToHouseholdChat } = require("../config/socket");
const cloudinary = require("cloudinary").v2;

const { ObjectId } = require("mongoose").Types;

exports.getAll = async (userId, householdId, lastMessageId = null) => {
    const limit = 20;
    const household = await Household.findById(householdId);

    // Check if the user is a member of the household
    const userIndex = household.members.findIndex(
        (member) => member.user.toString() === userId
    );
    if (userIndex === -1) {
        throw new AppError("Потребителят не е член на домакинството.", 401);
    }

    // Construct the match stage to filter messages
    let matchStage = { household: new ObjectId(householdId) };

    // If lastMessageId is provided, add condition to fetch messages before this ID
    if (lastMessageId) {
        matchStage._id = { $lt: new ObjectId(lastMessageId) };
    }

    // Aggregation pipeline to fetch messages
    const pipeline = [
        { $match: matchStage },
        { $sort: { createdAt: -1 } }, // Sort by createdAt in descending order for fetching the latest messages first
        { $limit: limit }, // Limit the number of records returned
        {
            $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "senderDetails",
            },
        },
        { $unwind: "$senderDetails" },
        {
            $project: {
                _id: 1,
                text: 1,
                img: 1,
                household: 1,
                resourceType: 1,
                resourceId: 1,
                sender: {
                    _id: "$senderDetails._id",
                    name: "$senderDetails.name",
                    avatar: "$senderDetails.avatar",
                    avatarColor: "$senderDetails.avatarColor",
                },
                createdAt: 1,
            },
        },
        { $sort: { createdAt: 1 } }, // Sort by createdAt in ascending order for final output
    ];

    // Execute aggregation pipeline
    const messages = await Message.aggregate(pipeline);

    return messages;
};

exports.create = async (userId, householdId, messageData) => {
    if (
        !messageData.text?.trim() &&
        !messageData.img &&
        !messageData.resourceType
    ) {
        return; // Ignore empty messages
    }

    const senderId = userId;
    // Fetch user details from database
    const sender = await User.findById(senderId, {
        name: 1,
        avatar: 1,
        avatarColor: 1,
    });

    if (!sender) throw new Error("Потребителят не е намерен");

    // Create new message
    const newMessage = new Message({
        household: householdId,
        sender: senderId,
    });

    if (messageData.text) {
        newMessage.text = messageData.text;
    }

    if (messageData.img) {
        const uploadedResponse = await cloudinary.uploader.upload(
            messageData.img
        );
        newMessage.img = uploadedResponse.secure_url;
    }

    // Check if the resource exists and belongs to the household
    if (messageData.resourceType && messageData.resourceId) {
        const validResourceTypes = ["paidExpense", "payment"];
        if (validResourceTypes.includes(messageData.resourceType)) {
            let resourceModel;
            switch (messageData.resourceType) {
                case "paidExpense":
                    resourceModel = PaidExpense;
                    messageData.resourceType = "PaidExpense";
                    break;
                case "payment":
                    resourceModel = Payment;
                    messageData.resourceType = "Payment";
                    break;
                default:
                    throw new Error("Невалиден тип на ресурс");
            }

            const resource = await resourceModel.findById(
                messageData.resourceId
            );

            if (!resource || !resource.household.equals(householdId)) {
                throw new Error(
                    "Ресурсът не е намерен или не принадлежи към домакинството"
                );
            }

            newMessage.resourceType = messageData.resourceType;
            newMessage.resourceId = messageData.resourceId;
        } else {
            throw new Error("Невалиден ресурс");
        }
    }

    await newMessage.save();

    const messageToEmit = {
        _id: newMessage._id,
        text: newMessage.text,
        createdAt: newMessage.createdAt,
        household: householdId,
        sender: {
            _id: sender._id,
            name: sender.name,
            avatar: sender.avatar,
            avatarColor: sender.avatarColor,
        },
        img: newMessage.img,
        resourceType: newMessage.resourceType,
        resourceId: newMessage.resourceId,
    };

    sendMessageToHouseholdChat(householdId, messageToEmit);

    // Send notifications to mentioned users
    if (messageData.mentionedUsers && messageData.mentionedUsers.length > 0) {
        messageData.mentionedUsers.forEach(async (userId) => {
            const notification = new Notification({
                user: userId,
                message: `${sender.name} Ви спомена в съобщение.`,
                household: householdId,
            });

            const savedNotification = await notification.save();

            // Send notification to the user if they have an active connection
            sendNotificationToUser(userId, savedNotification);
        });
    }

    return newMessage;
};
