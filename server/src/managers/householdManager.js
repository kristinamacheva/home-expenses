const Household = require("../models/Household");
const User = require("../models/User");

// TODO: send different response if the resourse doesnt exist or is not found
// TODO: filter with search params in the db
exports.getAll = () => Household.find();

exports.getAllWithUsers = async (userId) => {
    const result = await Household.find({ "members.user": userId })
        .populate("members.user", "_id name email phone")
        .populate("admin", "name")
        .populate("balance.user", "_id name");

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
        .populate("admin", "name")
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
            throw new Error(`Admin user with ID ${admin} not found`);
        }

        // Fetch member users by their emails
        const memberEmails = members.map((member) => member.email);
        const memberUsers = await User.find({ email: { $in: memberEmails } });

        if (memberUsers.length !== memberEmails.length) {
            throw new Error("Some member emails not found");
        }

        // Construct members array with roles and user IDs, including the admin
        const memberList = [
            ...members
                .map((member) => {
                    const currentUser = memberUsers.find(
                        (user) => user.email === member.email
                    );
                    return {
                        user: currentUser._id,
                        role: member.role,
                    };
                }),
            {
                user: adminUser._id,
                role: "Админ",
            },
        ];

        const nonChildMembers = memberList.filter(member => member.role !== "Дете");

        // Construct balance array, including the admin
        const balanceList = [
            ...nonChildMembers.
            map((member) => ({
                user: member.user,
                sum: 0, // Default sum
                type: "+", // Default type
            }))
        ];

        // Identify all admin users
        const adminUsers = memberList.filter(member => member.role === "Админ").map(admin => admin.user);

        // Create the new household
        const newHousehold = new Household({
            name,
            admins: adminUsers,
            members: memberList,
            balance: balanceList,
        });

        // Save the household to the database
        await newHousehold.save();
        console.log("Household created:", newHousehold);
        return newHousehold;
    } catch (error) {
        console.error("Error creating household:", error);
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
