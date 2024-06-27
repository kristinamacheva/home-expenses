const router = require("express").Router();
const householdManager = require("../managers/householdManager");
const getHousehold = require("../middlewares/householdMiddleware");
const paidExpenseController = require("./paidExpenseController");
const { isAuth } = require("../middlewares/authMiddleware");
const getPaidExpense = require("../middlewares/paidExpenseMiddleware");
const { createValidator } = require("../validators/householdValidator");
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
        } else if (role === "child") {
            users = await householdManager.getOneChildMembers(householdId);
        } else if (role === "not-child") {
            users = await householdManager.getOneNonChildMembers(householdId);
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

// // TODO: update status
// router.put("/:householdId", async (req, res) => {
//     const householdId = req.householdId;

//     const household = await householdManager.update(householdId, req.body);
//     res.json(household);
// });

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

router.use("/:householdId/paidExpenses", paidExpenseController);

module.exports = router;


// router.get('/', async (req, res, next) => {
//     const userId = req.userId

//     try {
//         const households = await householdManager.getAllWithUsers(userId);
//         res.status(200).json(households);
//     } catch (error) {
//         next(error);
//     }
// });

// TODO
// router.delete('/:householdId', async (req, res) => {
//     const householdId = req.householdId;

//     await householdManager.delete(householdId);
//     // TODO: result
//     res.status(204).end();
// });

// router.get('/:householdId/reduced', async (req, res) => {
//     const householdId = req.householdId;

//     const household = await householdManager.getOneReducedData(householdId);
//     res.json(household);
// });