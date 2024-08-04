const mongoose = require('mongoose');
const Reminder = require('../models/Reminder');

const getReminder = async (req, res, next) => {
    const reminderId = req.params.reminderId;

    if (!mongoose.Types.ObjectId.isValid(reminderId)) {
        return res.status(404).json({ message: 'Invalid reminder ID format' });
    }

    try {
        const reminder = await Reminder.findById(reminderId);

        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        req.reminderId = reminderId;

        next();
    } catch (error) {
        console.error('Error fetching reminder:', error);
        return res.status(500).json({ message: 'Error fetching reminder' });
    }
}

module.exports = getReminder;