const { sendNotificationToUser } = require("../config/socket");
const Household = require("../models/Household");
const HouseholdInvitation = require("../models/HouseholdInvitation");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { AppError } = require("../utils/AppError");
const mongoose = require("mongoose");

exports.getAll = async (userId) => {
    const result = await HouseholdInvitation.find({ user: userId })
        .populate("household", "name")
        .populate("creator", "email")
        .lean();

    return result;
};

exports.getOne = async (userId, invitationId) => {
    const result = await HouseholdInvitation.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(invitationId) } },
        {
            $lookup: {
                from: "households",
                localField: "household",
                foreignField: "_id",
                as: "household",
            },
        },
        { $unwind: "$household" },
        {
            $lookup: {
                from: "users",
                localField: "household.members.user",
                foreignField: "_id",
                as: "householdMembers",
            },
        },
        {
            $addFields: {
                "household.members": {
                    $map: {
                        input: "$household.members",
                        as: "member",
                        in: {
                            _id: {
                                $arrayElemAt: [
                                    "$householdMembers._id",
                                    {
                                        $indexOfArray: [
                                            "$householdMembers._id",
                                            "$$member.user",
                                        ],
                                    },
                                ],
                            },
                            name: {
                                $arrayElemAt: [
                                    "$householdMembers.name",
                                    {
                                        $indexOfArray: [
                                            "$householdMembers._id",
                                            "$$member.user",
                                        ],
                                    },
                                ],
                            },
                            avatar: {
                                $arrayElemAt: [
                                    "$householdMembers.avatar",
                                    {
                                        $indexOfArray: [
                                            "$householdMembers._id",
                                            "$$member.user",
                                        ],
                                    },
                                ],
                            },
                            avatarColor: {
                                $arrayElemAt: [
                                    "$householdMembers.avatarColor",
                                    {
                                        $indexOfArray: [
                                            "$householdMembers._id",
                                            "$$member.user",
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "creator",
                foreignField: "_id",
                as: "creator",
            },
        },
        { $unwind: "$creator" },
        {
            $project: {
                _id: 1,
                user: 1,
                role: 1,
                household: {
                    _id: 1,
                    name: 1,
                    members: 1,
                },
                creator: {
                    _id: "$creator._id",
                    name: "$creator.name",
                    email: "$creator.email",
                    avatar: "$creator.avatar",
                    avatarColor: "$creator.avatarColor",
                },
            },
        },
    ]);

    return result.length ? result[0] : null;
};

exports.accept = async (userId, invitationId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const invitation = await HouseholdInvitation.findById(
            invitationId
        ).session(session);

        // Verify that the invitation is for the current user
        if (invitation.user.toString() !== userId) {
            throw new AppError(
                "Неоторизиран: Потребителят не съответства на поканата",
                401
            );
        }

        const household = await Household.findById(
            invitation.household
        ).session(session);

        if (!household) {
            throw new AppError("Домакинството не е намерено", 404);
        }

        // Check if the household is archived
        if (household.archived) {
            throw new AppError(`Домакинството е архивирано`, 403);
        }

        const role = invitation.role;

        // Add user to the household members
        household.members.push({
            user: userId,
            role: role,
        });

        // Update admins array if the user's role is "Админ"
        if (role === "Админ") {
            household.admins.push(userId);
        }

        // Add to balance with default values if the user's role is not "Дете"
        if (role !== "Дете") {
            household.balance.push({
                user: userId,
                sum: 0,
                type: "+",
            });
        } else {
            household.allowances.push({
                user: userId,
                sum: 0,
            });
        }

        // Save the updated household
        await household.save({ session });

        // Add householdId to the user's households array
        await User.findByIdAndUpdate(
            userId,
            {
                $addToSet: { households: household._id },
            },
            { session }
        );

        // Delete the invitation
        await HouseholdInvitation.deleteOne({ _id: invitationId }).session(
            session
        );

        // Create and send notifications for all members except the newly added one
        const message = `Нов потребител се присъедини към домакинството: ${household.name}`;

        for (const member of household.members) {
            if (member.user.toString() !== userId) {
                const notification = new Notification({
                    user: member.user,
                    message: message,
                    household: household._id,
                });

                const savedNotification = await notification.save({ session });

                // Send notification to the user if they have an active connection
                sendNotificationToUser(member.user, savedNotification);
            }
        }

        await session.commitTransaction();
        session.endSession();

        return household._id; // Return household ID after successful acceptance and deletion
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

exports.reject = async (userId, invitationId) => {
    const invitation = await HouseholdInvitation.findById(invitationId);

    // Verify that the invitation is for the current user
    if (invitation.user.toString() !== userId) {
        throw new AppError(
            "Неоторизиран: Потребителят не съответства на поканата",
            401
        );
    }

    // Delete the invitation
    const deletionResult = await HouseholdInvitation.deleteOne({
        _id: invitationId,
    });

    if (deletionResult.deletedCount === 0) {
        throw new AppError("Неуспешно изтриване на поканата", 500);
    }
};
