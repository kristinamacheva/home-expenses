const mongoose = require('mongoose');

// TODO: make users unique in the array
const householdSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [
        {
            _id: {
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
            _id: {
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
