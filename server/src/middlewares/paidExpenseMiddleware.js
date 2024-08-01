const mongoose = require('mongoose');
const PaidExpense = require('../models/PaidExpense');

const getPaidExpense = async (req, res, next) => {
    const paidExpenseId = req.params.paidExpenseId;

    if (!mongoose.Types.ObjectId.isValid(paidExpenseId)) {
        return res.status(404).json({ message: 'Invalid paid expense ID format' });
    }

    try {
        const paidExpense = await PaidExpense.findById(paidExpenseId);

        if (!paidExpense) {
            return res.status(404).json({ message: 'Разходът не е намерен' });
        }

        req.paidExpenseId = paidExpenseId;

        next();
    } catch (error) {
        console.error('Error fetching paid expense:', error);
        return res.status(500).json({ message: 'Error fetching paid expense' });
    }
}

module.exports = getPaidExpense;