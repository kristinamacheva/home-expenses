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
    query("purchased")
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage("Purchased трябва да бъде булева стойност"),
    query("notPurchased")
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage("NotPurchased трябва да бъде булева стойност"),
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
];

module.exports.updateValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Заглавието не може да бъде празно"),

    body("amount")
        .toFloat()
        .isFloat({ gt: 0 })
        .withMessage("Сумата трябва да бъде число, по-голямо от 0"),
];
