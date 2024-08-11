const mongoose = require('mongoose');
const ExpenseTemplate = require('../models/ExpenseTemplate');

const getExpenseTemplate = async (req, res, next) => {
    const expenseTemplateId = req.params.expenseTemplateId;

    if (!mongoose.Types.ObjectId.isValid(expenseTemplateId)) {
        return res.status(404).json({ message: 'Invalid expense template ID format' });
    }

    try {
        const expenseTemplate = await ExpenseTemplate.findById(expenseTemplateId);

        if (!expenseTemplate) {
            return res.status(404).json({ message: 'Шаблонът не е намерен' });
        }

        req.expenseTemplateId = expenseTemplateId;

        next();
    } catch (error) {
        console.error('Error fetching expense template:', error);
        return res.status(500).json({ message: 'Error fetching expense template' });
    }
}

module.exports = getExpenseTemplate;