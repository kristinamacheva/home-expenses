const router = require("express").Router();
const householdManager = require("../managers/householdManager");
const getHousehold = require("../middlewares/householdMiddleware");
const paidExpenseController = require("./paidExpenseController");
const childExpenseController = require("./childExpenseController");
const expenseTemplateController = require("./expenseTemplateController");
const childWishlistItemController = require("./childWishlistItemController");
const paymentController = require("./paymentController");
const allowanceController = require("./allowanceController");
const categoryController = require("./categoryController");
const messageController = require("./messageController");
const {
    createValidator,
    updateValidator,
} = require("../validators/householdValidator");
const { AppError } = require("../utils/AppError");
const { validationResult } = require("express-validator");

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

    const { name, members } = req.body;

    try {
        const newHousehold = await householdManager.create({
            name,
            members,
            admin: req.userId,
        });

        res.status(201).json(newHousehold);
    } catch (error) {
        next(error);
    }
});

// Middleware to get householdId
router.use("/:householdId", getHousehold);

router.get("/:householdId", async (req, res, next) => {
    const householdId = req.householdId;

    try {
        const household = await householdManager.getOneWithMembers(householdId);

        res.status(200).json(household);
    } catch (error) {
        next(error);
    }
});

router.get("/:householdId/members", async (req, res, next) => {
    const { role, details } = req.query;
    let users;
    const householdId = req.householdId;

    try {
        if (details === "true") {
            users = await householdManager.getOneMembersDetails(householdId);
        } else if (details === "email") {
            users = await householdManager.getOneWithMemberEmails(householdId);
        } else if (role === "child") {
            users = await householdManager.getOneChildMembers(householdId);
        } else if (role === "not-child") {
            users = await householdManager.getOneNonChildMembers(householdId);
        } else if (role === "not-child-and-over-18") {
            users = await householdManager.getOneNonChildAndOver18Members(
                householdId
            );
        } else {
            users = await householdManager.getOneMembers(householdId);
        }

        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
});

router.get("/:householdId/balances", async (req, res, next) => {
    const householdId = req.householdId;

    try {
        const balances = await householdManager.getOneBalances(householdId);

        res.status(200).json(balances);
    } catch (error) {
        next(error);
    }
});

router.get("/:householdId/payees", async (req, res, next) => {
    const householdId = req.householdId;

    try {
        const payees = await householdManager.getOnePayees(householdId);

        res.status(200).json(payees);
    } catch (error) {
        next(error);
    }
});

router.get("/:householdId/payers", async (req, res, next) => {
    const householdId = req.householdId;

    try {
        const payers = await householdManager.getOnePayers(householdId);

        res.status(200).json(payers);
    } catch (error) {
        next(error);
    }
});

router.get("/:householdId/allowance", async (req, res, next) => {
    const householdId = req.householdId;
    const userId = req.userId;
    const childId = req.query.childId;

    try {
        let allowance;

        if (childId) {
            allowance = await householdManager.getAllowanceForChild(
                userId,
                childId,
                householdId
            );
        } else {
            allowance = await householdManager.getAllowanceForUser(
                userId,
                householdId
            );
        }

        res.status(200).json(allowance);
    } catch (error) {
        next(error);
    }
});

router.put("/:householdId", updateValidator, async (req, res, next) => {
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
    const admin = req.userId;

    const { name, members, newMembers = [] } = req.body;

    try {
        await householdManager.update(
            householdId,
            admin,
            name,
            members,
            newMembers
        );
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.put("/:householdId/leave", async (req, res, next) => {
    const userId = req.userId;
    const householdId = req.householdId;

    try {
        await householdManager.leave(userId, householdId);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.put("/:householdId/archive", async (req, res, next) => {
    const userId = req.userId;
    const householdId = req.householdId;

    try {
        await householdManager.archive(userId, householdId);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.put("/:householdId/restore", async (req, res, next) => {
    const userId = req.userId;
    const householdId = req.householdId;

    try {
        await householdManager.restore(userId, householdId);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.use("/:householdId/paidExpenses", paidExpenseController);
router.use("/:householdId/childExpenses", childExpenseController);
router.use("/:householdId/expenseTemplates", expenseTemplateController);
router.use("/:householdId/childWishlistItems", childWishlistItemController);
router.use("/:householdId/payments", paymentController);
router.use("/:householdId/allowances", allowanceController);
router.use("/:householdId/categories", categoryController);
router.use("/:householdId/messages", messageController);

module.exports = router;
