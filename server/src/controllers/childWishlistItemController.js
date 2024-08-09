const router = require("express").Router();
const childWishlistItemManager = require("../managers/childWishlistItemManager");
const { isAuth } = require("../middlewares/authMiddleware");
const getChildWishlistItem = require("../middlewares/childWishlistItemMiddleware");
const { validationResult } = require("express-validator");
const {
    getValidator,
    createValidator,
    updateValidator,
} = require("../validators/childWishlistItemValidator");
const { AppError } = require("../utils/AppError");

router.get("/", getValidator, async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));

        return next(
            new AppError("Данните са некоректни", 400, formattedErrors)
        );
    }

    const householdId = req.householdId;
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const childId = req.query.childId;

    const searchParams = {
        title: req.query.title || "",
        purchased: req.query.purchased === "false" ? false : null,
        notPurchased: req.query.notPurchased === "false" ? false : null,
    };

    try {
        let childWishlistItems, totalCount;
        if (childId) {
            ({ childWishlistItems, totalCount } =
                await childWishlistItemManager.getAllSelectedChild(
                    userId,
                    childId,
                    householdId,
                    page,
                    limit,
                    searchParams
                ));
        } else {
            ({ childWishlistItems, totalCount } =
                await childWishlistItemManager.getAll(
                    userId,
                    householdId,
                    page,
                    limit,
                    searchParams
                ));
        }

        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = page < totalPages;

        res.status(200).json({ data: childWishlistItems, hasMore });
    } catch (error) {
        next(error);
    }
});

router.post("/", createValidator, async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));

        return next(
            new AppError("Данните са некоректни", 400, formattedErrors)
        );
    }

    const { title, amount } = req.body;
    const parsedAmount = Number(amount.toFixed(2));

    try {
        const newChildWishlistItem = await childWishlistItemManager.create({
            title,
            child: req.userId,
            amount: parsedAmount,
            household: req.householdId,
        });

        res.status(201).json(newChildWishlistItem);
    } catch (error) {
        next(error);
    }
});

router.use("/:childWishlistItemId", getChildWishlistItem);

router.get("/:childWishlistItemId", async (req, res, next) => {
    const childWishlistItemId = req.childWishlistItemId;
    const { editable } = req.query;

    try {
        let childWishlistItem;
        if (editable === "true") {
            childWishlistItem =
                await childWishlistItemManager.getEditableFields(
                    childWishlistItemId
                );
        } else {
            // Handle default case
            childWishlistItem = await childWishlistItemManager.getOne(
                childWishlistItemId
            );
        }

        res.status(200).json(childWishlistItem);
    } catch (error) {
        next(error);
    }
});

router.put("/:childWishlistItemId", updateValidator, async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));

        return next(
            new AppError("Данните са некоректни", 400, formattedErrors)
        );
    }

    const childWishlistItemId = req.childWishlistItemId;
    const userId = req.userId;

    const { title, amount } = req.body;

    const parsedAmount = Number(amount.toFixed(2));

    const childWishlistItemData = {
        title,
        child: req.userId,
        amount: parsedAmount,
        household: req.householdId,
    };

    try {
        await childWishlistItemManager.update(
            userId,
            childWishlistItemId,
            childWishlistItemData
        );

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.delete("/:childWishlistItemId", async (req, res, next) => {
    const userId = req.userId;
    const childWishlistItemId = req.childWishlistItemId;

    try {
        await childWishlistItemManager.delete(userId, childWishlistItemId);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.put("/:childWishlistItemId/purchase", async (req, res, next) => {
    const childWishlistItemId = req.childWishlistItemId;
    const userId = req.userId;

    try {
        await childWishlistItemManager.purchase(userId, childWishlistItemId);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
