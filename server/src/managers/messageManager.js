const Household = require("../models/Household");
const { AppError } = require("../utils/AppError");
const { default: mongoose } = require("mongoose");
const Message = require("../models/Message");
const { sendNotificationToUser } = require("../config/socket");

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
