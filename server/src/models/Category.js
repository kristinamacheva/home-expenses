const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    predefined: { type: Boolean, default: false },
    householdId: {
        type: mongoose.Types.ObjectId,
        ref: "Household",
        required: function () {
            return !this.predefined;
        }, // required only if not predefined
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: function () {
            return !this.predefined;
        },
    }, // Only required for user-defined categories
});

// Convert title to capitalize the first letter and make the rest lowercase before saving
categorySchema.pre("save", function (next) {
    if (this.title) {
        this.title =
            this.title.charAt(0).toUpperCase() +
            this.title.slice(1).toLowerCase();
    }
    next();
});

// Create unique index on title and householdId
categorySchema.index({ title: 1, householdId: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
