const { query, body } = require("express-validator");

module.exports.getValidator = [
    query("page")
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage("Трябва да въведете страница по-голяма от 0"),
    query("limit")
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage("Трябва да въведете лимит по-голям от 0"),
    query("title").optional({ checkFalsy: true }).trim(),
    query("category").optional({ checkFalsy: true }).trim(),
    query("startDate")
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage(
            "Невалиден формат на началната дата (форматът трябва да бъде YYYY-MM-DD)"
        )
        .bail()
        .toDate(),
    query("endDate")
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage(
            "Невалиден формат на крайната дата (форматът трябва да бъде YYYY-MM-DD)"
        )
        .bail()
        .toDate()
        .custom((value, { req }) => {
            if (req.query.startDate && value) {
                const startDate = req.query.startDate;
                if (value < startDate) {
                    throw new Error(
                        "Крайната дата трябва да бъде след началната дата"
                    );
                }
            }
            return true;
        }),
    query("approved")
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage("Approved трябва да бъде булева стойност"),
    query("forApproval")
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage("ForApproval трябва да бъде булева стойност"),
    query("rejected")
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage("Rejected трябва да бъде булева стойност"),
];

module.exports.createValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Заглавието не може да бъде празно"),

    body("amount")
        .toFloat()
        .isFloat({ gt: 0 })
        .withMessage("Сумата трябва да бъде число, по-голямо от 0"),

    body("date").isISO8601().toDate().withMessage("Невалидна дата"),

    body("paidSplitType")
        .trim()
        .notEmpty()
        .withMessage("Методът на разпределяне за плащане е задължителен")
        .bail()
        .isIn(["Единично", "Поравно", "Ръчно"])
        .withMessage("Невалиден метод на разпределяне за плащане"),

    body("paid")
        .isArray({ min: 1 })
        .withMessage("Платците трябва да бъдат определени"),

    body("paid.*._id")
        .trim()
        .notEmpty()
        .withMessage("Платецът трябва да има валидно ID"),

    body("paid.*.sum")
        .toFloat()
        .isFloat({ gt: 0 })
        .withMessage("Сумата трябва да бъде число, по-голямо от 0"),

    body("owedSplitType")
        .trim()
        .notEmpty()
        .withMessage("Методът на разпределяне на задължение е задължителен")
        .bail()
        .isIn(["Поравно", "Процентно", "Ръчно"])
        .withMessage("Невалиден метод на разпределяне на задължение"),

    body("owed")
        .isArray({ min: 1 })
        .withMessage("Дължимите суми трябва да бъдат определени"),
    body("owed.*._id")
        .trim()
        .notEmpty()
        .withMessage("Длъжникът трябва да има валидно ID"),
    body("owed.*.sum")
        .toFloat()
        .isFloat({ gt: 0 })
        .withMessage("Сумата трябва да бъде число, по-голямо от 0"),
];

module.exports.statisticsValidator = [
    query("startDate")
        .isISO8601()
        .withMessage(
            "Невалиден формат на началната дата (форматът трябва да бъде YYYY-MM-DD)"
        )
        .bail()
        .toDate(),
    query("endDate")
        .isISO8601()
        .withMessage(
            "Невалиден формат на крайната дата (форматът трябва да бъде YYYY-MM-DD)"
        )
        .bail()
        .toDate()
        .custom((value, { req }) => {
            if (req.query.startDate && value) {
                const startDate = req.query.startDate;
                if (value < startDate) {
                    throw new Error(
                        "Крайната дата трябва да бъде след началната дата"
                    );
                }
            }
            return true;
        }),
];
