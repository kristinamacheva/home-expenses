const { body } = require("express-validator");

module.exports.createValidator = [
    body("household")
        .trim()
        .notEmpty()
        .withMessage("Полето 'Домакинство' е задължително"),
    body("receiver")
        .trim()
        .notEmpty()
        .withMessage("Полето 'Получател' е задължително"),
    body("message")
        .trim()
        .notEmpty()
        .withMessage("Полето 'Съобщение' е задължително"),
];
