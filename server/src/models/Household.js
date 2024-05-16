const mongoose = require("mognoose");

// {
//     "_id": "1",
//     "name": "Съквартиранти",
//     "members": [
//         { "userId": "1", "role": "Админ" },
//         { "userId": "2", "role": "Член" }
//     ],
//     "admin": { "userId": "1" },
//     "balance": [
//         { "userId": "1", "sum": 60, "type": "+" },
//         { "userId": "2", "sum": 60, "type": "-" }
//     ],
// },

const householdSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // members: [
    //     {
    //         userId: {
    //             type: Schema.Types.ObjectId,
    //             ref: "User",
    //             required: true,
    //         },
    //         role: { type: String, enum: ["Админ", "Член"], required: true },
    //     },
    // ],
    // admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // balance: [
    //     {
    //         userId: {
    //             type: Schema.Types.ObjectId,
    //             ref: "User",
    //             required: true,
    //         },
    //         sum: { type: Number, required: true },
    //         type: { type: String, enum: ["+", "-"], required: true },
    //     },
    // ],
});

const Household = mongoose.model("Household", householdSchema);
