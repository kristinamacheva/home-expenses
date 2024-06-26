const { body } = require("express-validator");

const User = require("../models/User");

module.exports.loginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Имейлът не може да бъде празен")
        .bail()
        .isEmail()
        .withMessage("Имейлът е невалиден")
        .normalizeEmail(),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Паролата не може да бъде празна"),
];

module.exports.registerValidator = [
    body("name").trim().notEmpty().withMessage("Името не може да бъде празно"),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Имейлът не може да бъде празен")
        .bail()
        .isEmail()
        .withMessage("Имейлът е невалиден")
        .normalizeEmail()
        .bail()
        .custom(async (email) => {
            // Finding if email exists in Database
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                throw new Error("Имейлът е зает");
            }
        }),
    body("phone")
        .optional({ checkFalsy: true }) // Makes the phone field optional
        .isMobilePhone("any") // Validates that the phone is a valid mobile phone number
        .withMessage("Невалиден телефонен номер"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Паролата не може да бъде празна")
        .bail()
        .isLength({ min: 8 })
        .withMessage("Паролата трябва да е поне 8 символа")
        .bail()
        .matches(/\d/)
        .withMessage("Паролата трябва да съдържа поне една цифра")
        .bail()
        .matches(/[a-zA-Z]/)
        .withMessage("Паролата трябва да съдържа поне една буква")
        .bail()
        .matches(/[!@#$%^&*(),.?":{}|<>\-_]/)
        .withMessage("Паролата трябва да съдържа поне един специален символ"),
    body("repeatPassword")
        .trim()
        .notEmpty()
        .withMessage("Повторната парола не може да бъде празна")
        .bail()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Паролите трябва да съвпадат");
            }
            return true;
        }),
];

module.exports.updateValidator = [
    body("name").trim().notEmpty().withMessage("Името не може да бъде празно"),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Имейлът не може да бъде празен")
        .bail()
        .isEmail()
        .withMessage("Имейлът е невалиден")
        .normalizeEmail(),
    body("phone")
        .optional({ checkFalsy: true }) // Makes the phone field optional
        .isMobilePhone("any") // Validates that the phone is a valid mobile phone number
        .withMessage("Невалиден телефонен номер"),
    body("password")
        .optional({ checkFalsy: true })
        .trim()
        .notEmpty()
        .withMessage("Паролата не може да бъде празна")
        .bail()
        .isLength({ min: 8 })
        .withMessage("Паролата трябва да е поне 8 символа")
        .bail()
        .matches(/\d/)
        .withMessage("Паролата трябва да съдържа поне една цифра")
        .bail()
        .matches(/[a-zA-Z]/)
        .withMessage("Паролата трябва да съдържа поне една буква")
        .bail()
        .matches(/[!@#$%^&*(),.?":{}|<>\-_]/)
        .withMessage("Паролата трябва да съдържа поне един специален символ"),
    body("repeatPassword")
        .optional({ checkFalsy: true })
        .trim()
        .notEmpty()
        .withMessage("Повторната парола не може да бъде празна")
        .bail()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Паролите трябва да съвпадат");
            }
            return true;
        }),
    // Custom validator to ensure if one is provided, the other must be too
    body("password").custom((value, { req }) => {
        if (
            (value && !req.body.repeatPassword) ||
            (!value && req.body.repeatPassword)
        ) {
            throw new Error(
                "И двете полета за парола трябва да бъдат попълнени"
            );
        }
        return true;
    }),
];
