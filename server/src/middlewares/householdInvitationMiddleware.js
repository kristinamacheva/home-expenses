const mongoose = require('mongoose');
const HouseholdInvitation = require('../models/HouseholdInvitation');

const getHouseholdInvitation = async (req, res, next) => {
    const invitationId = req.params.invitationId;

    if (!mongoose.Types.ObjectId.isValid(invitationId)) {
        return res.status(404).json({ message: 'Invalid household invitation ID format' });
    }

    try {
        const invitation = await HouseholdInvitation.findById(invitationId);

        if (!invitation) {
            return res.status(404).json({ message: 'Household invitation not found' });
        }

        req.invitationId = invitationId;

        next();
    } catch (error) {
        console.error('Error fetching household invitation:', error);
        return res.status(500).json({ message: 'Error fetching household invitation' });
    }
}

module.exports = getHouseholdInvitation;