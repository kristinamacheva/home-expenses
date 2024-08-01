const router = require("express").Router();
const messageManager = require("../managers/messageManager");
const { isAuth } = require("../middlewares/authMiddleware");
const { validationResult } = require("express-validator");
const { AppError } = require("../utils/AppError");
const getMessage = require("../middlewares/messageMiddleware");

router.get("/", async (req, res, next) => {
    const householdId = req.householdId;
    const userId = req.userId;
    const lastMessageId = req.query.lastMessageId;

    try {
        // Fetch messages before the lastMessageId, if provided
        const messages = await messageManager.getAll(
            userId,
            householdId,
            lastMessageId
        );

        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
});

router.use("/:messageId", getMessage);

module.exports = router;
