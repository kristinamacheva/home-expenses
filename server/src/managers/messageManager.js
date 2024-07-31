const Household = require("../models/Household");
const User = require("../models/User");
const PaidExpense = require("../models/PaidExpense");
const Notification = require("../models/Notification");
const { AppError } = require("../utils/AppError");
const { default: mongoose } = require("mongoose");
const Message = require("../models/Message");
const { sendNotificationToUser } = require("../config/socket");

const { ObjectId } = require("mongoose").Types;

exports.getAll = async (userId, householdId, page, limit) => {
    const household = await Household.findById(householdId);

    // Check if the user is a member of the household
    const userIndex = household.members.findIndex(
        (member) => member.user.toString() === userId
    );
    if (userIndex === -1) {
        throw new AppError("Потребителят не е член на домакинството.", 401);
    }


    // Aggregation pipeline to fetch payments
    const pipeline = [
        { $match: { household: new ObjectId(householdId) } },
        { $sort: { createdAt: 1 } }, // Sort by createdAt in ascending order
        // Lookup for payer details
        {
            $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "senderDetails",
            },
        },
        // Unwind the sender details arrays
        { $unwind: "$senderDetails" },
        {
            $project: {
                _id: 1,
                text: 1,
                img: 1,
                sender: {
                    _id: "$senderDetails._id",
                    name: "$senderDetails.name",
                    avatar: "$senderDetails.avatar",
                    avatarColor: "$senderDetails.avatarColor",
                },
            },
        },
    ];

    // Execute aggregation pipeline
    const messages = await Message.aggregate(pipeline);


    return messages;
};