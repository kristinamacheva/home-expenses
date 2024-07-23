const mongoose = require("mongoose");
const Category = require("../../models/Category");
const predefinedCategories = require("./predefinedCategories");

const insertCategories = async () => {
    try {
        // Check if predefined categories already exist
        const existingCategories = await Category.find({ predefined: true });
        const existingTitles = existingCategories.map((cat) =>
            cat.title.toLowerCase()
        );

        // Filter out categories that already exist
        const newCategories = predefinedCategories.filter(
            (cat) => !existingTitles.includes(cat.title.toLowerCase())
        );

        if (newCategories.length > 0) {
            // Insert only new categories
            await Category.insertMany(newCategories);
            console.log("Predefined categories inserted successfully");
        } else {
            console.log("Predefined categories already exist");
        }
    } catch (err) {
        console.error("Failed to insert predefined categories", err);
    }
};

module.exports = insertCategories;
