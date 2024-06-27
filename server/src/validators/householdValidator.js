const { body } = require("express-validator");

module.exports.createValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Името не може да бъде празно"),
    body("members")
        .isArray()
        .withMessage("Членовете трябва да бъдат масив"),
    body("members.*.email")
        .trim()
        .notEmpty()
        .withMessage("Имейлът не може да бъде празен")
        .bail()
        .isEmail()
        .withMessage("Имейлът е невалиден")
        .normalizeEmail(),
    body("members.*.role")
        .trim()
        .notEmpty()
        .withMessage("Ролята не може да бъде празна")
        .bail()
        .isIn(["Админ", "Член", "Дете"])
        .withMessage('Невалидна роля. Позволени стойности са "Админ", "Член" или "Дете".'),
];