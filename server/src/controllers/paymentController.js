const router = require("express").Router();
const paymentManager = require("../managers/paymentManager");
const { isAuth } = require("../middlewares/authMiddleware");
const getPayment = require("../middlewares/paymentMiddleware");
const { validationResult } = require("express-validator");
const {
    getValidator,
    createValidator,
} = require("../validators/paymentValidator");
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
        startDate: req.query.startDate || "",
        endDate: req.query.endDate || "",
        approved: req.query.approved === "false" ? false : null,
        forApproval: req.query.forApproval === "false" ? false : null,
        rejected: req.query.rejected === "false" ? false : null,
    };

    try {
        const { payments, totalCount } = await paymentManager.getAll(
            userId,
            householdId,
            page,
            limit,
            searchParams
        );

        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = page < totalPages;

        res.status(200).json({ data: payments, hasMore });
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
        amount,
        date,
        payee,
    } = req.body;

    const parsedAmount = Number(amount.toFixed(2));

    try {
        const newPayment = await paymentManager.create({
            amount: parsedAmount,
            date,
            payer: req.userId,
            payee,
            household: req.householdId,
        });

        res.status(201).json(newPayment);
    } catch (error) {
        next(error);
    }
});


router.use("/:paymentId", getPayment);

router.get("/:paymentId", async (req, res, next) => {
    const paymentId = req.paymentId;
    const userId = req.userId;
    const { details } = req.query;

    try {
        let payment;
        if (details === "all") {
            payment = await paymentManager.getOneDetails(
                paymentId,
                userId
            );
        } else {
            // Handle default case
            payment = await paymentManager.getOne(paymentId);
        }

        res.status(200).json(payment);
    } catch (error) {
        next(error);
    }
});

router.put("/:paymentId/accept", async (req, res, next) => {
    const paymentId = req.paymentId;
    const userId = req.userId;

    try {
        await paymentManager.accept(userId, paymentId);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.put("/:paymentId/reject", async (req, res, next) => {
    const paymentId = req.paymentId;
    const userId = req.userId;
    const { text } = req.body;

    if (text.trim() === "") {
        return next(
            new AppError(
                "Трябва да дадете причина за отхвърляне на плащането",
                400,
                formattedErrors
            )
        );
    }

    try {
        await paymentManager.reject(userId, paymentId, text);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.post("/:paymentId/comments", async (req, res, next) => {
    const { text } = req.body;
    const paymentId = req.paymentId;
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
        const comments = await paymentManager.addComment(
            userId,
            paymentId,
            text
        );

        res.status(201).json(comments);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
