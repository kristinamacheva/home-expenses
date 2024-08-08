const mongoose = require("mongoose");

const childWishlistItemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Полето 'Заглавие' е задължително"],
        },
        child: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, "Полето 'Дете' е задължително"],
        },
        household: {
            type: mongoose.Types.ObjectId,
            ref: "Household",
            required: [true, "Полето 'Домакинство' е задължително"],
        },
        amount: {
            type: Number,
            required: [true, "Полето 'Сума' е задължително"],
        },
        purchased: {
            type: Boolean,
            default: false,
        },
        purchaseDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const ChildWishlistItem = mongoose.model(
    "ChildWishlistItem",
    childWishlistItemSchema
);

module.exports = ChildWishlistItem;
