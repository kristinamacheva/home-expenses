const mongoose = require('mongoose');
const Allowance = require('../models/Allowance');

const getAllowance = async (req, res, next) => {
    const allowanceId = req.params.allowanceId;

    if (!mongoose.Types.ObjectId.isValid(allowanceId)) {
        return res.status(404).json({ message: 'Invalid allowance ID format' });
    }

    try {
        const allowance = await Allowance.findById(allowanceId);

        if (!allowance) {
            return res.status(404).json({ message: 'Allowance not found' });
        }

        req.allowanceId = allowanceId;

        next();
    } catch (error) {
        console.error('Error fetching allowance:', error);
        return res.status(500).json({ message: 'Error fetching allowance' });
    }
}

module.exports = getAllowance;