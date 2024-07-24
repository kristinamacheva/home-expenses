const mongoose = require('mongoose');
const Category = require('../models/Category');

const getCategory = async (req, res, next) => {
    const categoryId = req.params.categoryId;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(404).json({ message: 'Invalid category ID format' });
    }

    try {
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        req.categoryId = categoryId;

        next();
    } catch (error) {
        console.error('Error fetching category:', error);
        return res.status(500).json({ message: 'Error fetching category' });
    }
}

module.exports = getCategory;