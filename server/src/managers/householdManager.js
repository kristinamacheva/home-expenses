const Household = require("../models/Household");

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

exports.create = (householdData) => {
    // TODO: implement logic for the users
    const household = new Household(householdData);
    return household.save();
};
