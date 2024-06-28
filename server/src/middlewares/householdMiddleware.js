const mongoose = require('mongoose');
const Household = require('../models/Household');

const getHousehold = async (req, res, next) => {
    const householdId = req.params.householdId;

    if (!mongoose.Types.ObjectId.isValid(householdId)) {
        return res.status(404).json({ message: 'Invalid household ID format' });
    }

    try {
        const household = await Household.findById(householdId);

        if (!household) {
            return res.status(404).json({ message: 'Household not found' });
        }

        req.householdId = householdId;

        next();
    } catch (error) {
        console.error('Error fetching household:', error);
        return res.status(500).json({ message: 'Error fetching household' });
    }
}

module.exports = getHousehold;