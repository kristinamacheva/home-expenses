const router = require("express").Router();
const childExpenseManager = require("../managers/childExpenseManager");
const getChildExpense = require("../middlewares/childExpenseMiddleware");
const { validationResult } = require("express-validator");
const {
    getValidator,
    createValidator,
} = require("../validators/childExpenseValidator");
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
        startDate: req.query.startDate || "",
        endDate: req.query.endDate || "",
    };

    try {
        const { childExpenses, totalCount } = await childExpenseManager.getAll(
            userId,
            householdId,
            page,
            limit,
            searchParams
        );

        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = page < totalPages;

        res.status(200).json({ data: childExpenses, hasMore });
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

    const { title, amount, date } = req.body;

    const parsedAmount = Number(amount.toFixed(2));

    try {
        const newChildExpense = await childExpenseManager.create({
            title,
            child: req.userId,
            amount: parsedAmount,
            date,
            household: req.householdId,
        });

        res.status(201).json(newChildExpense);
    } catch (error) {
        next(error);
    }
});

router.use("/:childExpenseId", getChildExpense);

module.exports = router;
