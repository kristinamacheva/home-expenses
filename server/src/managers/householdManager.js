const Household = require("../models/Household");
const HouseholdInvitation = require("../models/HouseholdInvitation");
const Notification = require("../models/Notification");
const Category = require("../models/Category");
const User = require("../models/User");
const mongoose = require("mongoose");
const { AppError } = require("../utils/AppError");
const { sendNotificationToUser } = require("../config/socket");

exports.getOneWithMembers = async (householdId) => {
    const aggregationPipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(householdId), // Match the household by its ObjectId
            },
        },
        {
            $lookup: {
                from: "users", // Collection to join for members
                localField: "members.user",
                foreignField: "_id",
                as: "userDetails",
            },
        },
        {
            $addFields: {
                members: {
                    $map: {
                        input: "$members",
                        as: "member",
                        in: {
                            user: {
                                $arrayElemAt: [
                                    "$userDetails",
                                    {
                                        $indexOfArray: [
                                            "$userDetails._id",
                                            "$$member.user",
                                        ],
                                    },
                                ],
                            },
                            role: "$$member.role",
                        },
                    },
                },
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                admins: 1,
                members: {
                    $map: {
                        input: "$members",
                        as: "member",
                        in: {
                            _id: "$$member.user._id",
                            name: "$$member.user.name",
                            avatar: "$$member.user.avatar",
                            avatarColor: "$$member.user.avatarColor",
                            role: "$$member.role",
                        },
                    },
                },
            },
        },
    ];

    const household = await Household.aggregate(aggregationPipeline);
    return household[0]; // Return the first result (assuming householdId is unique)
};

exports.getOneWithMemberEmails = async (householdId) => {
    const aggregationPipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(householdId), // Match the household by its ObjectId
            },
        },
        {
            $unwind: "$members", // Unwind the members array
        },
        {
            $lookup: {
                from: "users", // Collection to join for members
                localField: "members.user",
                foreignField: "_id",
                as: "memberDetails",
            },
        },
        {
            $unwind: "$memberDetails", // Unwind the memberDetails array
        },
        {
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                members: {
                    $push: {
                        _id: "$memberDetails._id",
                        email: "$memberDetails.email",
                        role: "$members.role",
                    },
                },
            },
        },
    ];

    const household = await Household.aggregate(aggregationPipeline);
    return household[0]; // Return the first result
};

exports.getOneMembers = async (householdId) => {
    const pipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(householdId) } },
        { $unwind: "$members" },
        {
            $lookup: {
                from: "users",
                localField: "members.user",
                foreignField: "_id",
                as: "userDetails",
            },
        },
        { $unwind: "$userDetails" },
        {
            $project: {
                _id: "$userDetails._id",
                name: "$userDetails.name",
                email: "$userDetails.email",
            },
        },
    ];

    const result = await Household.aggregate(pipeline);

    return result;
};

exports.getOneMembersDetails = async (householdId) => {
    const allMembers = await Household.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(householdId) } }, // Match the household by ID
        { $unwind: "$members" }, // Deconstruct the members array
        {
            $lookup: {
                from: "users", // Perform a join with the users collection
                localField: "members.user", // Match user field in members
                foreignField: "_id", // with _id field in users collection
                as: "userDetails", // Output to userDetails array
            },
        },
        { $unwind: "$userDetails" }, // Deconstruct the userDetails array
        {
            $project: {
                _id: 0, // Exclude the default _id field from the output
                "members._id": "$userDetails._id", // Include user _id
                "members.name": "$userDetails.name", // Include user name
                "members.email": "$userDetails.email", // Include user email
                "members.phone": "$userDetails.phone", // Include user phone
                "members.avatar": "$userDetails.avatar", // Include user avatar
                "members.avatarColor": "$userDetails.avatarColor", // Include user avatarColor
                "members.role": 1, // Include member role
            },
        },
        {
            $group: {
                _id: "$_id", // Group by household ID (can be null since we're only matching one household)
                members: {
                    $push: {
                        _id: "$members._id",
                        name: "$members.name",
                        email: "$members.email",
                        phone: "$members.phone",
                        avatar: "$members.avatar",
                        avatarColor: "$members.avatarColor",
                        role: "$members.role",
                    },
                },
            },
        },
        {
            $project: {
                _id: 0, // Exclude the grouping key from the output
                members: 1, // Include the members array
            },
        },
    ]);

    if (allMembers.length > 0) {
        return allMembers[0].members;
    }
    return [];
};

exports.getOneNonChildMembers = async (householdId) => {
    const household = await Household.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(householdId) } }, // Match the household by ID
        { $unwind: "$members" }, // Deconstruct the members array
        { $match: { "members.role": { $ne: "Дете" } } }, // Filter out child members
        {
            $lookup: {
                from: "users", // Perform a join with the users collection
                localField: "members.user", // Match user field in members
                foreignField: "_id", // with _id field in users collection
                as: "userDetails", // Output to userDetails array
            },
        },
        { $unwind: "$userDetails" }, // Deconstruct the userDetails array
        {
            $project: {
                _id: 0, // Exclude the default _id field from the output
                "userDetails._id": 1, // Include user _id
                "userDetails.name": 1, // Include user name
                "userDetails.avatar": 1, // Include user avatar
                "userDetails.avatarColor": 1, // Include user avatarColor
                "members.role": 1, // Include member role
            },
        },
        {
            $group: {
                _id: null, // Group by null to aggregate all documents into one array
                nonChildMembers: {
                    $push: {
                        _id: "$userDetails._id",
                        name: "$userDetails.name",
                        avatar: "$userDetails.avatar",
                        avatarColor: "$userDetails.avatarColor",
                        role: "$members.role",
                    },
                },
            },
        },
        {
            $project: {
                _id: 0, // Exclude the grouping key from the output
                nonChildMembers: 1, // Include the nonChildMembers array
            },
        },
    ]);

    if (household.length > 0) {
        return household[0].nonChildMembers;
    }
    return [];
};

exports.getOneChildMembers = async (householdId) => {
    const household = await Household.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(householdId) } }, // Match the household by ID
        { $unwind: "$members" }, // Deconstruct the members array
        { $match: { "members.role": "Дете" } }, // Filter to include only child members
        {
            $lookup: {
                from: "users", // Perform a join with the users collection
                localField: "members.user", // Match user field in members
                foreignField: "_id", // with _id field in users collection
                as: "userDetails", // Output to userDetails array
            },
        },
        { $unwind: "$userDetails" }, // Deconstruct the userDetails array
        {
            $project: {
                _id: 0, // Exclude the default _id field from the output
                "userDetails._id": 1, // Include user _id
                "userDetails.name": 1, // Include user name
                "userDetails.email": 1, // Include user name
                "userDetails.avatar": 1, // Include user avatar
                "userDetails.avatarColor": 1, // Include user avatarColor
                "members.role": 1, // Include member role
            },
        },
        {
            $group: {
                _id: null, // Group by null to aggregate all documents into one array
                childMembers: {
                    $push: {
                        _id: "$userDetails._id",
                        name: "$userDetails.name",
                        email: "$userDetails.email",
                        avatar: "$userDetails.avatar",
                        avatarColor: "$userDetails.avatarColor",
                        role: "$members.role",
                    },
                },
            },
        },
        {
            $project: {
                _id: 0, // Exclude the grouping key from the output
                childMembers: 1, // Include the childMembers array
            },
        },
    ]);

    if (household.length > 0) {
        return household[0].childMembers;
    }
    return [];
};

exports.getOneBalances = async (householdId) => {
    const allBalances = await Household.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(householdId) } }, // Match the household by ID
        { $unwind: "$balance" }, // Deconstruct the balance array
        {
            $lookup: {
                from: "users", // Perform a join with the users collection
                localField: "balance.user", // Match user field in balance
                foreignField: "_id", // with _id field in users collection
                as: "userDetails", // Output to userDetails array
            },
        },
        { $unwind: "$userDetails" }, // Deconstruct the userDetails array
        {
            $project: {
                _id: 0, // Exclude the default _id field from the output
                "balance._id": "$userDetails._id", // Include user _id in balance
                "balance.name": "$userDetails.name", // Include user name in balance
                "balance.avatar": "$userDetails.avatar", // Include user avatar in balance
                "balance.avatarColor": "$userDetails.avatarColor", // Include user avatarColor in balance
                "balance.type": "$balance.type", // Include balance type
                "balance.sum": "$balance.sum", // Include balance sum
            },
        },
        {
            $group: {
                _id: "$_id", // Group by household ID (can be null since we're only matching one household)
                balance: {
                    $push: {
                        _id: "$balance._id",
                        name: "$balance.name",
                        avatar: "$balance.avatar",
                        avatarColor: "$balance.avatarColor",
                        type: "$balance.type",
                        sum: "$balance.sum",
                    },
                },
            },
        },
        {
            $project: {
                _id: 0, // Exclude the grouping key from the output
                balance: 1, // Include the balance array
            },
        },
    ]);

    if (allBalances.length > 0) {
        return allBalances[0].balance;
    }
    return [];
};

exports.getOnePayees = async (householdId) => {
    const allPayees = await Household.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(householdId) } }, // Match the household by ID
        { $unwind: "$balance" }, // Deconstruct the balance array
        { $match: { "balance.type": "+", "balance.sum": { $gt: 0 } } }, // Filter balances with type '+' and sum > 0
        {
            $lookup: {
                from: "users", // Perform a join with the users collection
                localField: "balance.user", // Match user field in balance
                foreignField: "_id", // with _id field in users collection
                as: "userDetails", // Output to userDetails array
            },
        },
        { $unwind: "$userDetails" }, // Deconstruct the userDetails array
        {
            $project: {
                _id: 0, // Exclude the default _id field from the output
                "balance._id": "$userDetails._id", // Include user _id in balance
                "balance.email": "$userDetails.email", // Include user email in balance
                "balance.name": "$userDetails.name", // Include user name in balance
                "balance.avatar": "$userDetails.avatar", // Include user avatar in balance
                "balance.avatarColor": "$userDetails.avatarColor", // Include user avatarColor in balance
                "balance.sum": "$balance.sum", // Include balance sum
            },
        },
        {
            $group: {
                _id: null, // Group by null since we're only matching one household
                balance: {
                    $push: {
                        _id: "$balance._id",
                        email: "$balance.email",
                        name: "$balance.name",
                        avatar: "$balance.avatar",
                        avatarColor: "$balance.avatarColor",
                        sum: "$balance.sum",
                    },
                },
            },
        },
        {
            $project: {
                _id: 0, // Exclude the grouping key from the output
                balance: 1, // Include the balance array
            },
        },
    ]);

    if (allPayees.length > 0) {
        return allPayees[0].balance;
    }
    return [];
};

exports.create = async (householdData) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { name, members, admin } = householdData;

        // Fetch the admin user by ID
        const adminUser = await User.findById(admin).session(session);
        // if (!adminUser) {
        //     throw new AppError("Админът не е намерен", 401);
        // }

        // Check if admin's email is in members array
        const adminEmail = adminUser.email;
        const adminInMembers = members.some(
            (member) => member.email === adminEmail
        );
        if (adminInMembers) {
            throw new AppError(
                "Създателят не може да бъде добавен повторно като член на домакинството",
                400
            );
        }

        // Check for duplicate emails in members
        const uniqueEmails = new Set();
        for (const member of members) {
            if (uniqueEmails.has(member.email)) {
                throw new AppError(
                    `Имейлът се среща повече от 1 път: ${member.email}`,
                    400
                );
            }
            uniqueEmails.add(member.email);
        }

        // Fetch member users by their emails
        const memberUsers = await User.find({
            email: { $in: Array.from(uniqueEmails) },
        })
            .select("_id email")
            .session(session);

        if (memberUsers.length !== uniqueEmails.size) {
            throw new AppError("1 или повече имейла не бяха намерени", 400);
        }

        // Fetch predefined category IDs
        const predefinedCategoryIds = await Category.find({ predefined: true })
            .select("_id")
            .session(session)
            .lean()
            .then((categories) => categories.map((category) => category._id));

        // Create the new household
        const newHousehold = new Household({
            name,
            members: [
                {
                    user: adminUser._id,
                    role: "Админ",
                },
            ],
            admins: [adminUser._id],
            balance: [
                {
                    user: adminUser._id,
                    sum: 0, // Default sum
                    type: "+", // Default type
                },
            ],
            categories: predefinedCategoryIds,
        });

        // Save the household to the database
        await newHousehold.save({ session });

        // Add the household ID to the admin user's households array
        adminUser.households.push(newHousehold._id);
        await adminUser.save({ session });

        //TODO: check if user is already a member
        // Create invitations for each member
        for (const member of members) {
            const currentUser = memberUsers.find(
                (user) => user.email === member.email
            );

            const invitation = new HouseholdInvitation({
                user: currentUser._id,
                household: newHousehold._id,
                role: member.role,
                creator: adminUser._id,
            });

            await invitation.save({ session });

            // Create notification for the user
            const notification = new Notification({
                userId: currentUser._id,
                message: `Имате нова покана за присъединяване към домакинство: ${name}`,
                resourceType: "HouseholdInvitation",
                resourceId: invitation._id, // Use the invitation._id here
            });

            const savedNotification = await notification.save({ session });

            // Send notification to the user if they have an active connection
            sendNotificationToUser(currentUser._id, savedNotification);
        }

        await session.commitTransaction();
        session.endSession();

        return newHousehold;
    } catch (error) {
        // Discard all changes and release any locks held by the transaction
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

exports.update = async (householdId, admin, name, members, newMembers) => {
    // Fetch the admin user by ID
    const adminUser = await User.findById(admin);

    // Fetch the household by ID
    const household = await Household.findById(householdId);

    if (!household.admins.includes(adminUser._id)) {
        throw new AppError(
            "Потребителят не е администратор на това домакинство.",
            403
        );
    }

    // Update household name if it has changed
    if (name !== household.name) {
        household.name = name;
    }

    // Update roles for existing members and handle removal if needed
    for (const existingMember of household.members) {
        // Check if the existing member is in the updated members list
        const updatedMember = members.find(
            (member) => member._id === existingMember.user.toString()
        );

        if (updatedMember) {
            // Update role if it has changed
            if (updatedMember.role !== existingMember.role) {
                // Prevent changing role to "Дете" if current role is "Админ" or "Член"
                if (
                    (existingMember.role === "Админ" ||
                        existingMember.role === "Член") &&
                    updatedMember.role === "Дете"
                ) {
                    throw new AppError(
                        `Не може да промените ролята на потребителя от Админ или Член в 'Дете'.`,
                        403
                    );
                }

                // Check if user is becoming an admin
                if (updatedMember.role === "Админ") {
                    // Add to admins array if not already an admin
                    if (!household.admins.includes(updatedMember._id)) {
                        household.admins.push(updatedMember._id);
                    }
                } else if (
                    existingMember.role === "Админ" &&
                    updatedMember.role === "Член"
                ) {
                    // Remove from admins array if changing from admin to member
                    household.admins = household.admins.filter(
                        (adminId) => adminId.toString() !== updatedMember._id
                    );
                }

                existingMember.role = updatedMember.role;
            }
        } else {
            // Remove from balance array if balance is 0
            const userBalance = household.balance.find(
                (entry) =>
                    entry.user.toString() === existingMember.user.toString()
            );

            if (userBalance) {
                if (userBalance.sum !== 0) {
                    throw new AppError(
                        `Не може да премахвате член, чийто баланс е различен от 0.`,
                        403
                    );
                }
                household.balance = household.balance.filter(
                    (entry) =>
                        entry.user.toString() !== existingMember.user.toString()
                );
            }

            // Member does not exist in the updated list, remove from household
            household.members = household.members.filter(
                (member) =>
                    member.user.toString() !== existingMember.user.toString()
            );

            // Remove from admins array if applicable
            if (existingMember.role === "Админ") {
                household.admins = household.admins.filter(
                    (adminId) =>
                        adminId.toString() !== existingMember.user.toString()
                );
            }

            // Remove householdId from user's households array
            await User.findByIdAndUpdate(existingMember.user, {
                $pull: { households: householdId },
            });
        }
    }

    // Create invitations for new members
    if (newMembers.length > 0) {
        // Check for duplicate emails in members
        const uniqueEmails = new Set();
        for (const member of newMembers) {
            if (uniqueEmails.has(member.email)) {
                throw new AppError(
                    `Имейлът се среща повече от 1 път: ${member.email}`,
                    400
                );
            }
            uniqueEmails.add(member.email);
        }
        // Fetch new member users by their emails
        const memberUsers = await User.find({
            email: { $in: Array.from(uniqueEmails) },
        }).select("_id email");

        if (memberUsers.length !== uniqueEmails.size) {
            throw new AppError("1 или повече имейла не бяха намерени", 400);
        }

        // Extract _id values from memberUsers
        const memberUserIds = memberUsers.map((user) => user._id.toString());

        // Check if any memberUserIds are already in household.members
        const existingMemberIds = household.members.map((member) =>
            member.user.toString()
        );

        // Check if any memberUserIds are already in existingMemberIds
        const duplicates = memberUserIds.filter((userId) =>
            existingMemberIds.includes(userId)
        );

        if (duplicates.length > 0) {
            throw new AppError(
                `Един или повече потребители вече са членове на домакинството.`,
                400
            );
        }

        // Save the household to the database
        await household.save();

        // Create invitations for each member
        for (const member of newMembers) {
            const currentUser = memberUsers.find(
                (user) => user.email === member.email
            );

            // Check if an invitation already exists for this user and household
            const existingInvitation = await HouseholdInvitation.findOne({
                user: currentUser._id,
                household: householdId,
            });

            if (existingInvitation) {
                throw new AppError(
                    `Един или повече потребители вече имат покана за присъединяване към домакинството.`,
                    400
                );
            }

            const invitation = new HouseholdInvitation({
                user: currentUser._id,
                household: householdId,
                role: member.role,
                creator: adminUser._id,
            });

            await invitation.save();
        }
    } else {
        // Save the household to the database
        await household.save();
    }
};

exports.leave = async (userId, householdId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const household = await Household.findById(householdId).session(
            session
        );

        // Check if the user is a member of the household
        const userIndex = household.members.findIndex(
            (member) => member.user.toString() === userId
        );
        if (userIndex === -1) {
            throw new AppError("Потребителят не е член на домакинството.", 401);
        }

        // Check if the user is an admin (using admins array)
        const isAdmin = household.admins.some(
            (admin) => admin.toString() === userId
        );
        if (isAdmin) {
            // If the user is an admin, check if they are the last admin
            if (household.admins.length === 1) {
                throw new AppError(
                    "Вие сте единственият админ на домакинството и не може да го напуснете.",
                    403
                );
            }
        }

        // Check if the user's role is not "Дете"
        const userRole = household.members[userIndex].role;
        if (userRole !== "Дете") {
            // Check if the user has a non-zero balance sum
            const userBalance = household.balance.find(
                (entry) => entry.user.toString() === userId
            );
            if (userBalance && userBalance.sum !== 0) {
                throw new AppError(
                    "Не може да напуснете домакинството, ако балансът ви не е 0.",
                    403
                );
            }

            // Remove the user's balance entry if it exists and is zero
            household.balance = household.balance.filter(
                (entry) => entry.user.toString() !== userId
            );
        }

        // Remove the user from the members array
        household.members.splice(userIndex, 1);

        // Remove the user from the admins array
        if (isAdmin) {
            household.admins = household.admins.filter(
                (admin) => admin.toString() !== userId
            );
        }

        // Save the updated household
        await household.save({ session });

        // Remove the household from the user's households array
        await User.findByIdAndUpdate(
            userId,
            { $pull: { households: householdId } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return household._id; // Return household ID after successful leave
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

exports.archive = async (userId, householdId) => {
    // Fetch the household by ID
    const household = await Household.findById(householdId);

    if (!household.admins.includes(userId)) {
        throw new AppError(
            "Потребителят не е администратор на това домакинство.",
            403
        );
    }

    // Check if all balances are zero
    const allBalancesZero = household.balance.every(
        (balance) => balance.sum === 0
    );

    // Check if allowances exist and if all allowances are zero
    const allowancesExist =
        household.allowances && household.allowances.length > 0;
    const allAllowancesZero = allowancesExist
        ? household.allowances.every((allowance) => allowance.sum === 0)
        : true;

    if (!allBalancesZero || !allAllowancesZero) {
        throw new AppError(
            "Домакинството не може да бъде архивирано, защото не всички баланси и джобни са нула.",
            400
        );
    }

    // Archive the household
    household.archived = true;
    await household.save();

    // Send notifications to all members except the current user
    for (const member of household.members) {
        if (member.user.equals(userId)) {
            continue; // Skip the current user
        }

        // Create notification for the user
        const notification = new Notification({
            userId: member.user,
            message: `Домакинството ${household.name} беше архивирано`,
            resourceType: "Household",
            resourceId: household._id,
        });

        const savedNotification = await notification.save();

        // Send notification to the user if they have an active connection
        sendNotificationToUser(member.user, savedNotification);
    }
};

exports.restore = async (userId, householdId) => {
    // Fetch the household by ID
    const household = await Household.findById(householdId);

    if (!household.admins.includes(userId)) {
        throw new AppError(
            "Потребителят не е администратор на това домакинство.",
            403
        );
    }

    // Ensure the household is currently archived
    if (!household.archived) {
        throw new AppError("Домакинството не е архивирано и не може да бъде възстановено.", 400);
    }

    // Restore the household (unarchive it)
    household.archived = false;
    await household.save();

    // Send notifications to all members except the current user
    for (const member of household.members) {
        if (member.user.equals(userId)) {
            continue; // Skip the current user
        }

        // Create notification for the user
        const notification = new Notification({
            userId: member.user,
            message: `Домакинството ${household.name} беше възстановено`,
            resourceType: "Household",
            resourceId: household._id,
        });

        const savedNotification = await notification.save();

        // Send notification to the user if they have an active connection
        sendNotificationToUser(member.user, savedNotification);
    }
};

// TODO: send different response if the resourse doesnt exist or is not found
// TODO: filter with search params in the db
// exports.getAll = () => Household.find();

// exports.getAllWithUsers = async (userId) => {
//     const result = await Household.find({ "members.user": userId })
//         .populate("members.user", "_id name email phone")
//         .populate("balance.user", "_id name")
//         .lean();

//     return result;
// };

// exports.getOne = (householdId) => Household.findById(householdId);

// exports.getOneWithMembersAndBalance = (householdId) =>
//     Household.findById(householdId)
//         .populate("members.user", "_id name avatar avatarColor")
//         .populate("balance.user", "_id name avatar avatarColor");

// exports.getAllBalancesDetails = async (householdId) => {
//     const allMembersDetails = await Household.findById(householdId)
//         .populate("balance.user", "_id name avatar avatarColor")
//         .select("balance");

//     return allMembersDetails;
// };

// // TODO: Send email instead of id?
// exports.getOneReducedData = (householdId) => {
//     const household = this.getOne(householdId).populate(
//         "members.user",
//         "_id name email phone"
//     );
//     // if (!household) return null;

//     const { name, members } = household;

//     return { name, members };
// };

// // TODO: Validation, users
// exports.update = (householdId, householdData) =>
//     Household.findByIdAndUpdate(householdId, householdData);

// exports.delete = (householdId) => Household.findByIdAndDelete(householdId);

// exports.create = async (householdData) => {
//     try {
//         const { name, members, admin } = householdData;

//         // Fetch the admin user by ID
//         const adminUser = await User.findById(admin);
//         if (!adminUser) {
//             throw new Error(`Admin user with ID ${admin} not found`);
//         }

//         // Fetch member users by their emails
//         const memberEmails = members.map((member) => member.email);
//         const memberUsers = await User.find({ email: { $in: memberEmails } });

//         if (memberUsers.length !== memberEmails.length) {
//             throw new Error("Some member emails not found");
//         }

//         // Construct members array with roles and user IDs, including the admin
//         const memberList = [
//             ...members
//                 .map((member) => {
//                     const currentUser = memberUsers.find(
//                         (user) => user.email === member.email
//                     );
//                     return {
//                         user: currentUser._id,
//                         role: member.role,
//                     };
//                 }),
//             {
//                 user: adminUser._id,
//                 role: "Админ",
//             },
//         ];

//         const nonChildMembers = memberList.filter(member => member.role !== "Дете");

//         // Construct balance array, including the admin
//         const balanceList = [
//             ...nonChildMembers.
//             map((member) => ({
//                 user: member.user,
//                 sum: 0, // Default sum
//                 type: "+", // Default type
//             }))
//         ];

//         // Identify all admin users
//         const adminUsers = memberList.filter(member => member.role === "Админ").map(admin => admin.user);

//         // Create the new household
//         const newHousehold = new Household({
//             name,
//             admins: adminUsers,
//             members: memberList,
//             balance: balanceList,
//         });

//         // Save the household to the database
//         await newHousehold.save();
//         console.log("Household created:", newHousehold);
//         return newHousehold;
//     } catch (error) {
//         console.error("Error creating household:", error);
//         throw error;
//     }
// };
