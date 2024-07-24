const router = require("express").Router();
const categoryManager = require("../managers/categoryManager");
const { isAuth } = require("../middlewares/authMiddleware");
const getCategory = require("../middlewares/categoryMiddleware");
const { validationResult } = require("express-validator");
const { createValidator, updateValidator } = require("../validators/categoryValidator");
const { AppError } = require("../utils/AppError");

router.get("/", async (req, res, next) => {
    const householdId = req.householdId;
    const details = req.query.details;

    try {
        if (details) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const { categories, totalCount } =
                await categoryManager.getAllDetails(householdId, page, limit);

            const totalPages = Math.ceil(totalCount / limit);
            const hasMore = page < totalPages;

            res.status(200).json({ data: categories, hasMore });
        } else {
            const categories = await categoryManager.getAll(householdId);

            res.status(200).json(categories);
        }
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

    const { title, description } = req.body;

    try {
        const newCategory = await categoryManager.create({
            title,
            description,
            creator: req.userId,
            household: req.householdId,
        });

        res.status(201).json(newCategory);
    } catch (error) {
        next(error);
    }
});

router.use("/:categoryId", getCategory);

router.get("/:categoryId", async (req, res, next) => {
    const categoryId = req.categoryId;

    try {
        category = await categoryManager.getOne(categoryId);

        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
});

router.put("/:categoryId", updateValidator, async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));

        return next(new AppError("Данните са некоректни", 400, formattedErrors));
    }

    const userId = req.userId;
    const categoryId = req.categoryId;

    const { title, description } = req.body;

    try {
        await categoryManager.update({
            userId,
            categoryId,
            title,
            description,
        });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.delete("/:categoryId", async (req, res, next) => {
    const userId = req.userId;
    const categoryId = req.categoryId;

    try {
        await categoryManager.delete(userId, categoryId);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
