const router = require("express").Router();
const paidExpenseManager = require("../managers/paidExpenseManager");
const { isAuth } = require("../middlewares/authMiddleware");
const getPaidExpense = require("../middlewares/paidExpenseMiddleware");
const { validationResult } = require("express-validator");
const {
    getValidator,
    createValidator,
    statisticsValidator,
    updateValidator,
} = require("../validators/paidExpenseValidator");
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
        title: req.query.title || "",
        category: req.query.category || "",
        startDate: req.query.startDate || "",
        endDate: req.query.endDate || "",
        approved: req.query.approved === "false" ? false : null,
        forApproval: req.query.forApproval === "false" ? false : null,
        rejected: req.query.rejected === "false" ? false : null,
    };

    try {
        const { paidExpenses, totalCount } = await paidExpenseManager.getAll(
            userId,
            householdId,
            page,
            limit,
            searchParams
        );

        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = page < totalPages;

        res.status(200).json({ data: paidExpenses, hasMore });
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

    const {
        title,
        category,
        amount,
        date,
        paidSplitType,
        paid,
        owedSplitType,
        owed,
        child,
    } = req.body;

    const parsedPaid = paid
        .map((entry) => ({
            user: entry._id,
            sum: Number(entry.sum.toFixed(2)),
        }))
        .filter((entry) => entry.sum !== 0);

    const parsedOwed = owed
        .map((entry) => ({
            user: entry._id,
            sum: Number(entry.sum.toFixed(2)),
        }))
        .filter((entry) => entry.sum !== 0);

    const parsedAmount = Number(amount.toFixed(2));

    try {
        const newPaidExpense = await paidExpenseManager.create({
            title,
            category,
            creator: req.userId,
            amount: parsedAmount,
            date,
            paidSplitType,
            paid: parsedPaid,
            owedSplitType,
            owed: parsedOwed,
            household: req.householdId,
            child,
        });

        res.status(201).json(newPaidExpense);
    } catch (error) {
        next(error);
    }
});

router.get("/statistics", statisticsValidator, async (req, res, next) => {
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

    const searchParams = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
    };

    const { type } = req.query;
    let stats;

    try {
        if (type === "totalAmount") {
            stats = await paidExpenseManager.getTotalAmountStats(
                householdId,
                userId,
                searchParams
            );
        } else if (type === "totalAmountByCategory") {
            stats = await paidExpenseManager.getTotalAmountByCategoryStats(
                householdId,
                userId,
                searchParams
            );
        } else if (type === "totalAmountAndCount") {
            stats = await paidExpenseManager.getTotalAmountAndCountStats(
                householdId,
                userId,
                searchParams
            );
        } else {
            stats = [];
        }

        res.status(200).json(stats);
    } catch (error) {
        next(error);
    }
});

router.use("/:paidExpenseId", getPaidExpense);

router.get("/:paidExpenseId", async (req, res, next) => {
    const paidExpenseId = req.paidExpenseId;
    const userId = req.userId;
    const { details, editable } = req.query;

    try {
        let paidExpense;
        if (details === "all") {
            paidExpense = await paidExpenseManager.getOneDetails(
                paidExpenseId,
                userId
            );
        } else if (editable === "true") {
            paidExpense = await paidExpenseManager.getEditableFields(
                paidExpenseId
            );
        } else {
            // Handle default case
            paidExpense = await paidExpenseManager.getOne(paidExpenseId);
        }

        res.status(200).json(paidExpense);
    } catch (error) {
        next(error);
    }
});

router.put("/:paidExpenseId", updateValidator, async (req, res, next) => {
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

    const paidExpenseId = req.paidExpenseId;
    const userId = req.userId;

    const {
        title,
        category,
        amount,
        date,
        paidSplitType,
        paid,
        owedSplitType,
        owed,
        child,
    } = req.body;

    const parsedPaid = paid
        .map((entry) => ({
            user: entry._id,
            sum: Number(entry.sum.toFixed(2)),
        }))
        .filter((entry) => entry.sum !== 0);

    const parsedOwed = owed
        .map((entry) => ({
            user: entry._id,
            sum: Number(entry.sum.toFixed(2)),
        }))
        .filter((entry) => entry.sum !== 0);

    const parsedAmount = Number(amount.toFixed(2));

    const paidExpenseData = {
        title,
        category,
        creator: req.userId,
        amount: parsedAmount,
        date,
        paidSplitType,
        paid: parsedPaid,
        owedSplitType,
        owed: parsedOwed,
        household: req.householdId,
        child,
    };

    try {
        const updatedPaidExpense = await paidExpenseManager.update(userId, paidExpenseId, paidExpenseData);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.delete("/:paidExpenseId", async (req, res, next) => {
    const userId = req.userId;
    const paidExpenseId = req.paidExpenseId;

    try {
        await paidExpenseManager.delete(userId, paidExpenseId);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.put("/:paidExpenseId/accept", async (req, res, next) => {
    const paidExpenseId = req.paidExpenseId;
    const userId = req.userId;

    try {
        await paidExpenseManager.accept(userId, paidExpenseId);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.put("/:paidExpenseId/reject", async (req, res, next) => {
    const paidExpenseId = req.paidExpenseId;
    const userId = req.userId;
    const { text } = req.body;

    if (text.trim() === "") {
        return next(
            new AppError(
                "Трябва да дадете причина за отхвърляне на разхода",
                400,
                formattedErrors
            )
        );
    }

    try {
        await paidExpenseManager.reject(userId, paidExpenseId, text);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.post("/:paidExpenseId/comments", async (req, res, next) => {
    const { text } = req.body;
    const paidExpenseId = req.paidExpenseId;
    const userId = req.userId;

    if (text.trim() === "") {
        return next(
            new AppError(
                "Не може да изпращате празен коментар",
                400,
                formattedErrors
            )
        );
    }

    try {
        const comments = await paidExpenseManager.addComment(
            userId,
            paidExpenseId,
            text
        );

        res.status(201).json(comments);
    } catch (error) {
        next(error);
    }
});

// router.get('/:paidExpenseId', async (req, res) => {
//     // TODO: lean?
//     const paidExpense = await paidExpenseManager.getOne(req.params.paidExpenseId).lean();
//     console.log(req.user);
//     res.json(paidExpense);
// });

// router.put('/:paidExpenseId', async (req, res) => {
//     const paidExpense = await paidExpenseManager.update(req.params.paidExpenseId, req.body);
//     res.json(paidExpense);
// });

// router.delete('/:paidExpenseId', async (req, res) => {
//     await paidExpenseManager.delete(req.params.paidExpenseId);
//     // TODO: result
//     res.status(204).end();
// });

// router.get("/:paidExpenseId/comments", async (req, res, next) => {
//     const paidExpenseId = req.paidExpenseId;
//     // TODO: validate user is in household
//     const userId = req.userId;

//     try {
//         const comments = await paidExpenseManager.getAllComments(paidExpenseId);

//         res.status(200).json(comments);
//     } catch (error) {
//         next(error);
//     }
// });

module.exports = router;
