const Household = require("../models/Household");
const HouseholdInvitation = require("../models/HouseholdInvitation");
const User = require("../models/User");
const mongoose = require("mongoose");
const { AppError } = require("../utils/AppError");

// TODO: send different response if the resourse doesnt exist or is not found
// TODO: filter with search params in the db
exports.getAll = () => Household.find();

exports.getAllWithUsers = async (userId) => {
    const result = await Household.find({ "members.user": userId })
        .populate("members.user", "_id name email phone")
        .populate("balance.user", "_id name")
        .lean();

    return result;
};

exports.getOne = (householdId) => Household.findById(householdId);

exports.getOneWithUsersAndBalance = (householdId) =>
    this.getOne(householdId)
        .populate("members.user", "_id name email phone")
        // .populate("admins", "name")
        .populate("balance.user", "_id name");
// .populate('balance.user', '-_id name');
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

exports.getAllBalances = async (householdId) => {
    const allBalances = await Household.findById(householdId)
        .populate("balance.user", "_id name")
        .select("balance");

    return allBalances;
};

exports.getAllBalancesDetails = async (householdId) => {
    const allMembersDetails = await Household.findById(householdId)
        .populate("balance.user", "_id name avatar avatarColor")
        .select("balance");

    return allMembersDetails;
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

// TODO: Send email instead of id?
exports.getOneReducedData = (householdId) => {
    const household = this.getOne(householdId).populate(
        "members.user",
        "_id name email phone"
    );
    // if (!household) return null;

    const { name, members } = household;

    return { name, members };
};

exports.create = async (householdData) => {
    try {
        const { name, members, admin } = householdData;

        // Fetch the admin user by ID
        const adminUser = await User.findById(admin);
        if (!adminUser) {
            throw new Error(`Admin user not found`);
        }

        // Check for duplicate emails in members
        const uniqueEmails = new Set();
        for (const member of members) {
            if (uniqueEmails.has(member.email)) {
                throw new Error(`Duplicate email found: ${member.email}`);
            }
            uniqueEmails.add(member.email);
        }

        // Fetch member users by their emails
        // const memberEmails = members.map((member) => member.email);
        const memberUsers = await User.find({
            email: { $in: Array.from(uniqueEmails) },
        }).select("_id email");
        // console.log(memberUsers);

        if (memberUsers.length !== uniqueEmails.size) {
            throw new Error("Some member emails not found");
        }

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
        });

        // Save the household to the database
        await newHousehold.save();

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

            await invitation.save();
        }

        console.log("Household created:", newHousehold);
        return newHousehold;
    } catch (error) {
        console.error("Error creating household:", error);
        throw error;
    }
};

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

// TODO: fix error status
exports.leave = async (userId, householdId) => {
    try {
        const household = await Household.findById(householdId);

        // Check if the user is a member of the household
        const userIndex = household.members.findIndex(
            (member) => member.user.toString() === userId
        );
        if (userIndex === -1) {
            const error = {
                message: "Потребителят не е член на домакинството",
                statusCode: 404 
            };
            throw error;
        }

        // Check if the user is an admin (using admins array)
        const isAdmin = household.admins.some(admin => admin.toString() === userId);
        if (isAdmin) {
            // If the user is an admin, check if they are the last admin
            if (household.admins.length === 1) {
                const error = new Error("You are the only admin in the household and cannot leave");
                error.statusCode = 403; 
                throw error;
            }
        }

        // Check if the user's role is not "Дете"
        const userRole = household.members[userIndex].role;
        if (userRole !== 'Дете') {
            // Check if the user has a non-zero balance sum
            const userBalance = household.balance.find(
                (entry) => entry.user.toString() === userId
            );
            if (userBalance && userBalance.sum !== 0) {
                throw new Error("User cannot leave the household with a non-zero balance");
            }
        }

        // Remove the user from the members array
        household.members.splice(userIndex, 1);

        // Save the updated household
        await household.save();

        return { message: "Successfully left the household" };
    } catch (error) {
        throw error;
    }
};

// TODO: Validation, users
exports.update = (householdId, householdData) =>
    Household.findByIdAndUpdate(householdId, householdData);

exports.delete = (householdId) => Household.findByIdAndDelete(householdId);