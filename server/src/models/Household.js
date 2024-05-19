const mongoose = require('mongoose');

// TODO: make users unique in the array
// TODO: fix _id
const householdSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [
        {
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            role: { type: String, enum: ['Админ', 'Член'], required: true },
        },
    ],
    admin: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
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
