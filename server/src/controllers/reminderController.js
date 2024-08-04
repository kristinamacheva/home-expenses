const router = require("express").Router();
const reminderManager = require("../managers/reminderManager");
const getReminder = require("../middlewares/reminderMiddleware");
const { validationResult } = require("express-validator");
const { createValidator } = require("../validators/reminderValidator");
const { AppError } = require("../utils/AppError");

router.get("/", async (req, res, next) => {
    const userId = req.userId;

    try {
        const reminders = await reminderManager.getAll(userId);

        res.status(200).json(reminders);
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

    const userId = req.userId;
    const { household, receiver, message, resourceType, resourceId } = req.body;  

    try {
        const newReminder = await reminderManager.create({
            receiver,
            sender: userId,
            message,
            resourceType,
            resourceId,
            household,
        });

        res.status(201).json(newReminder);
    } catch (error) {
        next(error);
    }
});

router.use("/:reminderId", getReminder);

router.delete("/:reminderId", async (req, res, next) => {
    const reminderId = req.reminderId;

    try {
        await reminderManager.delete(reminderId);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
