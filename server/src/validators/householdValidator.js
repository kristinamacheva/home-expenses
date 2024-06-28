const { body } = require("express-validator");

module.exports.createValidator = [
    body("name").trim().notEmpty().withMessage("Името не може да бъде празно"),
    body("members").isArray().withMessage("Членовете трябва да бъдат масив"),
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
        .withMessage(
            'Невалидна роля. Позволени стойности са "Админ", "Член" или "Дете".'
        ),
];

module.exports.updateValidator = [
    body("name").trim().notEmpty().withMessage("Името не може да бъде празно"),
    body("members")
        .isArray({ min: 1 })
        .withMessage("Членовете трябва да бъдат масив с поне един елемент")
        .custom((members) => {
            const hasAdmin = members.some((member) => member.role === "Админ");
            if (!hasAdmin) {
                throw new Error("Поне един член трябва да бъде администратор");
            }
            return true;
        }),
    body("members.*.role")
        .trim()
        .notEmpty()
        .withMessage("Ролята не може да бъде празна")
        .bail()
        .isIn(["Админ", "Член", "Дете"])
        .withMessage(
            'Невалидна роля. Позволени стойности са "Админ", "Член" или "Дете".'
        ),
    body("newMembers")
        .optional({ checkFalsy: true })
        .isArray()
        .withMessage("Новите членове трябва да бъдат масив"),
    body("newMembers.*.email")
        .if(
            (value, { req }) =>
                Array.isArray(req.body.newMembers) &&
                req.body.newMembers.length > 0
        )
        .trim()
        .notEmpty()
        .withMessage("Имейлът не може да бъде празен")
        .bail()
        .isEmail()
        .withMessage("Имейлът е невалиден")
        .normalizeEmail(),
    body("newMembers.*.role")
        .if(
            (value, { req }) =>
                Array.isArray(req.body.newMembers) &&
                req.body.newMembers.length > 0
        )
        .trim()
        .notEmpty()
        .withMessage("Ролята не може да бъде празна")
        .bail()
        .isIn(["Админ", "Член", "Дете"])
        .withMessage(
            'Невалидна роля. Позволени стойности са "Админ", "Член" или "Дете".'
        ),
];
