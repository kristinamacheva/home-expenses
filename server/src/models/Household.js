const mongoose = require("mongoose");

const householdSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Полето име е задължително"] },
    members: [
        {
            user: {
                type: mongoose.Types.ObjectId,
                ref: "User",
                required: [true, "Полето член на домакинство е задължително"],
            },
            role: {
                type: String,
                enum: {
                    values: ["Админ", "Член", "Дете"],
                    message:
                        'Невалидна роля. Позволени стойности са "Админ", "Член" или "Дете".',
                },
                required: [true, "Полето роля е задължително"],
            },
        },
    ],
    admins: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, "Полето админ е задължително"],
        },
    ],
    balance: [
        {
            user: {
                type: mongoose.Types.ObjectId,
                ref: "User",
                required: [true, "Полето потребител в баланса е задължително"],
            },
            sum: { type: Number, default: 0 },
            type: { type: String, enum: ["+", "-"], default: "+" },
        },
    ],
    allowances: [
        {
            user: {
                type: mongoose.Types.ObjectId,
                ref: "User",
                required: [true, "Полето потребител в джобни е задължително"],
            },
            sum: { type: Number, default: 0 },
        },
    ],
    categories: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Category',
        },
    ],
    archived: { type: Boolean, default: false },
});

// Create index for frequently queried array fields
householdSchema.index({ "members.user": 1 });

const Household = mongoose.model("Household", householdSchema);

module.exports = Household;
