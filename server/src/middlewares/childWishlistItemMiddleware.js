const mongoose = require("mongoose");
const ChildWishlistItem = require("../models/ChildWishlistItem");

const getChildWishlistItem = async (req, res, next) => {
    const childWishlistItemId = req.params.childWishlistItemId;

    if (!mongoose.Types.ObjectId.isValid(childWishlistItemId)) {
        return res
            .status(404)
            .json({ message: "Invalid child whishlist item ID format" });
    }

    try {
        const childWishlistItem = await ChildWishlistItem.findById(
            childWishlistItemId
        );

        if (!childWishlistItem) {
            return res.status(404).json({ message: "Желанието не е намерено" });
        }

        req.childWishlistItemId = childWishlistItemId;

        next();
    } catch (error) {
        console.error("Error fetching child whishlist item:", error);
        return res
            .status(500)
            .json({ message: "Error fetching child whishlist item" });
    }
};

module.exports = getChildWishlistItem;
