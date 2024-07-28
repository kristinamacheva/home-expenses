const router = require("express").Router();
const { isAuth } = require("../middlewares/authMiddleware");
const getAllowance = require("../middlewares/allowanceMiddleware");
const { AppError } = require("../utils/AppError");
const allowanceManager = require("../managers/allowanceManager");

router.get("/", async (req, res, next) => {
    const householdId = req.householdId;
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const { allowances, totalCount } = await allowanceManager.getAll(
            userId,
            householdId,
            page,
            limit,
        );

        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = page < totalPages;

        res.status(200).json({ data: allowances, hasMore });
    } catch (error) {
        next(error);
    }
});

router.use("/:allowanceId", getAllowance);

router.get("/:allowanceId", async (req, res, next) => {
    const allowanceId = req.allowanceId;

    try {
        allowance = await allowanceManager.getOne(allowanceId);

        res.status(200).json(allowance);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
