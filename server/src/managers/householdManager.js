const Household = require("../models/Household");
const HouseholdInvitation = require("../models/HouseholdInvitation");
const User = require("../models/User");

// TODO: send different response if the resourse doesnt exist or is not found
// TODO: filter with search params in the db
exports.getAll = () => Household.find();

exports.getAllWithUsers = async (userId) => {
    const result = await Household.find({ "members.user": userId })
        .populate("members.user", "_id name email phone")
        // .populate("admins", "name")
        .populate("balance.user", "_id name").lean();

    return result;
};

// exports.getAllWithUsers = () =>
//     Household.find()
//         .populate("members.user", "_id name email phone")
//         .populate("admin", "name")
//         .populate("balance.user", "_id name");

exports.getOne = (householdId) => Household.findById(householdId);

exports.getOneWithUsersAndBalance = (householdId) =>
    this.getOne(householdId)
        .populate("members.user", "_id name email phone")
        // .populate("admins", "name")
        .populate("balance.user", "_id name");
// .populate('balance.user', '-_id name');

exports.getAllMembers = async (householdId) => {
    const allMembers = await Household.findById(householdId)
        .populate("members.user", "_id name")
        .select("members");

    return allMembers.members;
};

exports.getAllMembersDetails = async (householdId) => {
    const allMembers = await Household.findById(householdId)
        .populate("members.user", "_id name email phone")
        .select("members");

    return allMembers.members;
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

exports.getAllNonChildMembers = async (householdId) => {
    // TODO: try using direct mongoose query
    try {
        const allMembers = await this.getAllMembers(householdId);
        const nonChildMembers = allMembers.filter(
            (member) => member.role !== "Дете"
        );

        // let nonChildMembers = await Household.findById(householdId)
        // .select("members")
        // .populate("members.user", "_id name");

        // nonChildMembers = nonChildMembers.members.filter(member => member.role !== 'Дете');
        console.log(nonChildMembers);

        return nonChildMembers;
    } catch (error) {
        console.error("Error fetching non-child members:", error);
        throw error;
    }
};

exports.getAllChildMembers = async (householdId) => {
    try {
        const allMembers = await this.getAllMembers(householdId);
        const childMembers = allMembers.filter(
            (member) => member.role === "Дете"
        );

        return childMembers;
    } catch (error) {
        console.error("Error fetching child members:", error);
        throw error;
    }
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

// exports.create = (householdData) => {
//     // TODO: implement logic for the users
//     const household = new Household(householdData);
//     return household.save();
// };
