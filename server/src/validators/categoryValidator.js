const { body } = require("express-validator");

module.exports.createValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Заглавието не може да бъде празно"),
];