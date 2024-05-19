const mongoose = require('mongoose');

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
    //         sum: { type: Number, default: 0, required: true },
    //         type: { type: String, enum: ["+", "-"], default: '+', required: true },
    //     },
    // ],
});

const Household = mongoose.model('Household', householdSchema);

module.exports = Household;
