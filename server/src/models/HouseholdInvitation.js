const mongoose = require("mongoose");

const householdInvitationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    household: {
        type: mongoose.Types.ObjectId,
        ref: 'Household',
        required: true,
    },
    role: {
        type: String,
        enum: ['Админ', 'Член', 'Дете'],
        required: true,
    },
    creator: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

householdInvitationSchema.index({ user: 1, household: 1 }, { unique: true });

const HouseholdInvitation = mongoose.model('HouseholdInvitation', householdInvitationSchema);

module.exports = HouseholdInvitation;