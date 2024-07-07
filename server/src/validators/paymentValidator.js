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
    body("amount")
        .toFloat()
        .isFloat({ gt: 0 })
        .withMessage("Сумата трябва да бъде число, по-голямо от 0"),
    body("date").isISO8601().toDate().withMessage("Невалидна дата"),
    body("payee")
        .trim()
        .notEmpty()
        .withMessage("Полето 'Получател' е задължително"),
];
