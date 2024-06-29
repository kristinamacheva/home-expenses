const router = require("express").Router();
const paidExpenseManager = require("../managers/paidExpenseManager");
const { isAuth } = require("../middlewares/authMiddleware");
const getPaidExpense = require("../middlewares/paidExpenseMiddleware");
const { validationResult } = require("express-validator");
const {
    getValidator,
    statisticsValidator,
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

router.post("/", async (req, res, next) => {
    const {
        title,
        category,
        amount,
        date,
        paidSplitType,
        paid,
        owedSplitType,
        owed,
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
            stats = await paidExpenseManager.getTotalAmountStats(householdId, userId, searchParams);
        // } else if (type === "categories") {
        //     users = await householdManager.getCategoriesStats(householdId);
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
    const { details } = req.query;

    try {
        let paidExpense;
        if (details === "all") {
            paidExpense = await paidExpenseManager.getOneDetails(
                paidExpenseId,
                userId
            );
        } else {
            // Handle default case
            // TODO: retirn only part of expense
            paidExpense = await paidExpenseManager.getOne(paidExpenseId);
        }

        res.status(200).json(paidExpense);
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

    try {
        await paidExpenseManager.reject(userId, paidExpenseId);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.post("/:paidExpenseId/comments", async (req, res) => {
    try {
        const { text } = req.body;
        const paidExpenseId = req.paidExpenseId;
        const userId = req.userId;

        const paidExpense = await paidExpenseManager.addComment(
            userId,
            paidExpenseId,
            text
        );

        res.status(200).json(paidExpense);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error adding comment to the paid expense",
        });
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

module.exports = router;
