const router = require("express").Router();
const expenseTemplateManager = require("../managers/expenseTemplateManager");
const getExpenseTemplate = require("../middlewares/expenseTemplateMiddleware");
const { validationResult } = require("express-validator");
const {
    getValidator,
    createValidator,
    updateValidator,
} = require("../validators/expenseTemplateValidator");
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

    const searchParams = {
        templateName: req.query.templateName || "",
        category: req.query.category || "",
    };

    try {
        const { expenseTemplates, totalCount } =
            await expenseTemplateManager.getAll(
                userId,
                householdId,
                page,
                limit,
                searchParams
            );

        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = page < totalPages;

        res.status(200).json({ data: expenseTemplates, hasMore });
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

        console.log(formattedErrors);

        return next(
            new AppError("Данните са некоректни", 400, formattedErrors)
        );
    }

    const {
        templateName,
        title = "",
        category,
        amount,
        paidSplitType = "",
        paid,
        owedSplitType = "",
        owed,
        child = "",
    } = req.body;

    let parsedPaid = [];
    let parsedOwed = [];

    if (paid && Array.isArray(paid)) {
        parsedPaid = paid.map((entry) => ({
            user: entry._id,
            sum: entry.sum ? Number(entry.sum.toFixed(2)) : 0,
        }));
    }

    if (owed && Array.isArray(owed)) {
        parsedOwed = owed.map((entry) => ({
            user: entry._id,
            sum: entry.sum ? Number(entry.sum.toFixed(2)) : 0,
        }));
    }

    const parsedAmount = Number(amount.toFixed(2));

    try {
        const newExpenseTemplate = await expenseTemplateManager.create({
            templateName,
            title,
            category,
            creator: req.userId,
            amount: parsedAmount,
            paidSplitType,
            paid: parsedPaid,
            owedSplitType,
            owed: parsedOwed,
            household: req.householdId,
            child,
        });

        res.status(201).json(newExpenseTemplate);
    } catch (error) {
        next(error);
    }
});

router.use("/:expenseTemplateId", getExpenseTemplate);

router.get("/:expenseTemplateId", async (req, res, next) => {
    const expenseTemplateId = req.expenseTemplateId;
    const { editable } = req.query;

    try {
        let expenseTemplate;
        if (editable === "true") {
            expenseTemplate = await expenseTemplateManager.getEditableFields(
                expenseTemplateId
            );
        } else {
            // Handle default case
            expenseTemplate = await expenseTemplateManager.getOne(
                expenseTemplateId
            );
        }

        res.status(200).json(expenseTemplate);
    } catch (error) {
        next(error);
    }
});

router.put("/:expenseTemplateId", updateValidator, async (req, res, next) => {
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

    const expenseTemplateId = req.expenseTemplateId;
    const userId = req.userId;

    const {
        templateName,
        title = "",
        category,
        amount,
        paidSplitType = "",
        paid,
        owedSplitType = "",
        owed,
        child = "",
    } = req.body;

    let parsedPaid = [];
    let parsedOwed = [];

    if (paid && Array.isArray(paid)) {
        parsedPaid = paid.map((entry) => ({
            user: entry._id,
            sum: entry.sum ? Number(entry.sum.toFixed(2)) : 0,
        }));
    }

    if (owed && Array.isArray(owed)) {
        parsedOwed = owed.map((entry) => ({
            user: entry._id,
            sum: entry.sum ? Number(entry.sum.toFixed(2)) : 0,
        }));
    }

    parsedAmount = Number(amount.toFixed(2));

    const expenseTemplateData = {
        templateName,
        title,
        category,
        creator: req.userId,
        amount: parsedAmount,
        paidSplitType,
        paid: parsedPaid,
        owedSplitType,
        owed: parsedOwed,
        household: req.householdId,
        child,
    };

    try {
        await expenseTemplateManager.update(
            userId,
            expenseTemplateId,
            expenseTemplateData
        );

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.delete("/:expenseTemplateId", async (req, res, next) => {
    const userId = req.userId;
    const expenseTemplateId = req.expenseTemplateId;

    try {
        await expenseTemplateManager.delete(userId, expenseTemplateId);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
