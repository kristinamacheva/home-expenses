const mongoose = require("mongoose");

const householdInvitationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Полето потребител е задължително'],
    },
    household: {
        type: mongoose.Types.ObjectId,
        ref: 'Household',
        required: [true, 'Полето домакинство е задължително'],
    },
    role: {
        type: String,
        enum: {
            values: ['Админ', 'Член', 'Дете'],
            message: 'Невалидна роля. Позволени стойности са "Админ", "Член" или "Дете".',
        },
        required: [true, 'Полето роля е задължително'],
    },
    creator: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Полето създател е задължително'],
    },
});

householdInvitationSchema.index({ user: 1, household: 1 }, { unique: true });

const HouseholdInvitation = mongoose.model('HouseholdInvitation', householdInvitationSchema);

module.exports = HouseholdInvitation;