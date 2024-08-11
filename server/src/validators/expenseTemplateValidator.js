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
    query("templateName").optional({ checkFalsy: true }).trim(),
    query("category").optional({ checkFalsy: true }).trim(),
];

module.exports.createValidator = [
    body("templateName")
        .trim()
        .notEmpty()
        .withMessage("Името не може да бъде празно"),

    body("title")
        .optional({ checkFalsy: true })
        .trim()
        .notEmpty()
        .withMessage("Заглавието не може да бъде празно"),

    body("amount")
        .toFloat()
        .isFloat({ gt: 0 })
        .withMessage("Сумата трябва да бъде число, по-голямо от 0"),

    body("paidSplitType")
        .optional({ checkFalsy: true })
        .trim()
        .notEmpty()
        .withMessage("Методът на разпределяне за плащане е задължителен")
        .bail()
        .isIn(["Единично", "Поравно", "Ръчно"])
        .withMessage("Невалиден метод на разпределяне за плащане"),

    body("paid.*.sum")
        .optional({ checkFalsy: true })
        .toFloat()
        .isFloat({ gt: 0 })
        .withMessage("Сумата трябва да бъде число, по-голямо от 0"),

    body("owedSplitType")
        .optional({ checkFalsy: true })
        .trim()
        .notEmpty()
        .withMessage("Методът на разпределяне на задължение е задължителен")
        .bail()
        .isIn(["Поравно", "Процентно", "Ръчно"])
        .withMessage("Невалиден метод на разпределяне на задължение"),

    body("owed.*.sum")
        .optional({ checkFalsy: true })
        .toFloat()
        .isFloat({ gt: 0 })
        .withMessage("Сумата трябва да бъде число, по-голямо от 0"),
];

module.exports.updateValidator = [
    body("templateName")
        .trim()
        .notEmpty()
        .withMessage("Името не може да бъде празно"),

    body("title")
        .optional({ checkFalsy: true })
        .trim()
        .notEmpty()
        .withMessage("Заглавието не може да бъде празно"),

    body("amount")
        .toFloat()
        .isFloat({ gt: 0 })
        .withMessage("Сумата трябва да бъде число, по-голямо от 0"),

    body("paidSplitType")
        .optional({ checkFalsy: true })
        .trim()
        .notEmpty()
        .withMessage("Методът на разпределяне за плащане е задължителен")
        .bail()
        .isIn(["Единично", "Поравно", "Ръчно"])
        .withMessage("Невалиден метод на разпределяне за плащане"),

    body("paid.*.sum")
        .optional({ checkFalsy: true })
        .toFloat()
        .isFloat({ gt: 0 })
        .withMessage("Сумата трябва да бъде число, по-голямо от 0"),

    body("owedSplitType")
        .optional({ checkFalsy: true })
        .trim()
        .notEmpty()
        .withMessage("Методът на разпределяне на задължение е задължителен")
        .bail()
        .isIn(["Поравно", "Процентно", "Ръчно"])
        .withMessage("Невалиден метод на разпределяне на задължение"),

    body("owed.*.sum")
        .optional({ checkFalsy: true })
        .toFloat()
        .isFloat({ gt: 0 })
        .withMessage("Сумата трябва да бъде число, по-голямо от 0"),
];
