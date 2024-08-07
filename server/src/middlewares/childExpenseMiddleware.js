const mongoose = require('mongoose');
const ChildExpense = require('../models/ChildExpense');

const getChildExpense = async (req, res, next) => {
    const childExpenseId = req.params.childExpenseId;

    if (!mongoose.Types.ObjectId.isValid(childExpenseId)) {
        return res.status(404).json({ message: 'Invalid child expense ID format' });
    }

    try {
        const childExpense = await ChildExpense.findById(childExpenseId);

        if (!childExpense) {
            return res.status(404).json({ message: 'Разходът не е намерен' });
        }

        req.childExpenseId = childExpenseId;

        next();
    } catch (error) {
        console.error('Error fetching child expense:', error);
        return res.status(500).json({ message: 'Error fetching child expense' });
    }
}

module.exports = getChildExpense;