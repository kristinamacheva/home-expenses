const mongoose = require('mongoose');

// TODO: make users unique in the array
// TODO: fix _id
const householdSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [
        {
            // TODO: type
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User',
                required: true,
                unique: true,
            },
            role: { type: String, enum: ['Админ', 'Член', 'Дете'], required: true },
        },
    ],
    admins: [{ type: mongoose.Types.ObjectId, ref: 'User', required: true }],
    balance: [
        {
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            sum: { type: Number, default: 0},
            type: { type: String, enum: ['+', '-'], default: '+' },
        },
    ],
});

const Household = mongoose.model('Household', householdSchema);

module.exports = Household;
