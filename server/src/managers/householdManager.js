const Household = require("../models/Household");
const User = require("../models/User");

// const households = [
//     {
//         "_id": "1",
//         "name": "Съквартиранти",
//         "members": [
//             { "userId": "1", "role": "Админ" },
//             { "userId": "2", "role": "Член" }
//         ],
//         "admin": { "userId": "1" },
//         "balance": [
//             { "userId": "1", "sum": 60, "type": "+" },
//             { "userId": "2", "sum": 60, "type": "-" }
//         ],
//     },
//     {
//         "_id": "2",
//         "name": "Вкъщи",
//         "members": [
//             { "userId": "1", "role": "Член" },
//             { "userId": "2", "role": "Член" },
//             { "userId": "3", "role": "Админ" }
//         ],
//         "admin": { "userId": "3" },
//         "balance": [
//             { "userId": "1", "sum": 30, "type": "-" },
//             { "userId": "2", "sum": 30, "type": "-" },
//             { "userId": "3", "sum": 60, "type": "+" }
//         ],
//     },
//     {
//         "_id": "3",
//         "name": "Обмен",
//         "members": [
//             { "userId": "1", "role": "Член" },
//             { "userId": "2", "role": "Админ" }
//         ],
//         "admin": { "userId": "2" },
//         "balance": [
//             { "userId": "1", "sum": 0, "type": "+" },
//             { "userId": "2", "sum": 0, "type": "+" }
//         ],
//     }
// ]

// TODO: send different response if the resourse doesnt exist or is not found
// TODO: filter with search params in the db
exports.getAll = () => Household.find();
exports.getAllWithUsers = () =>
    Household.find()
        .populate("members.user", "_id name email phone")
        .populate("admin", "name")
        .populate("balance.user", "_id name");

exports.getOne = (householdId) => Household.findById(householdId);

exports.getOneWithUsers = (householdId) =>
    this.getOne(householdId)
        .populate("members.user", "_id name email phone")
        .populate("admin", "name")
        .populate("balance.user", "_id name");
// .populate('balance.user', '-_id name');

// TODO: Send email instead of id?
exports.getOneReducedData = (householdId) => {
    const household = households.find((x) => x._id == householdId);
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
        const memberEmails = members.map(member => member.email);
        const memberUsers = await User.find({ email: { $in: memberEmails } });
        
        if (memberUsers.length !== memberEmails.length) {
            throw new Error('Some member emails not found');
        }

         // Construct members array with roles and user IDs, including the admin
         const memberList = [
            ...members.map(member => {
                const currentUser = memberUsers.find(user => user.email === member.email);
                return {
                    user: currentUser._id,
                    role: member.role,
                };
            }),
            {
                user: adminUser._id,
                role: 'Админ',
            }
        ];

        // Construct balance array, including the admin
        const balanceList = [
            ...memberUsers.map(user => ({
                user: user._id,
                sum: 0, // Default sum
                type: '+', // Default type
            })),
            {
                user: adminUser._id,
                sum: 0, // Default sum
                type: '+', // Default type
            }
        ];

        // Create the new household
        const newHousehold = new Household({
            name,
            admin: adminUser._id,
            members: memberList,
            balance: balanceList,
        });

        // Save the household to the database
        await newHousehold.save();
        console.log('Household created:', newHousehold);
        return newHousehold;
    } catch (error) {
        console.error('Error creating household:', error);
        throw error;
    }
};

// exports.create = (householdData) => {
//     // TODO: implement logic for the users
//     const household = new Household(householdData);
//     return household.save();
// };


