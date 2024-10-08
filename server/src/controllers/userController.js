const router = require("express").Router();

const { validationResult } = require("express-validator");
const userManager = require("../managers/userManager");
const notificationController = require("./notificationController");
const reminderController = require("./reminderController");
const { isAuth } = require("../middlewares/authMiddleware");
const {
    loginValidator,
    registerValidator,
    updateValidator,
} = require("../validators/userValidator");
const { AppError } = require("../utils/AppError");

router.post("/register", registerValidator, async (req, res, next) => {
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

    const { name, birthdate, email, phone, password, repeatPassword } =
        req.body;

    try {
        const { token, user } = await userManager.register({
            name,
            birthdate,
            email,
            phone,
            password,
            repeatPassword,
        });

        res.cookie("auth", token, { httpOnly: true });

        res.status(200).json({
            _id: user._id,
            email: user.email,
            birthdate: user.birthdate,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            avatarColor: user.avatarColor,
            avatar: user.avatar,
        });
    } catch (error) {
        next(error);
    }
});

router.post("/login", loginValidator, async (req, res, next) => {
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

    const { email, password } = req.body;

    try {
        const { token, user } = await userManager.login({ email, password });

        res.cookie("auth", token, { httpOnly: true });

        res.status(201).json({
            _id: user._id,
            email: user.email,
            birthdate: user.birthdate,
            name: user.name,
            phone: user.phone,
            avatarColor: user.avatarColor,
            avatar: user.avatar,
        });
    } catch (error) {
        next(error);
    }
});

router.get("/households", isAuth, async (req, res, next) => {
    const userId = req.userId;
    const { filterByBalance, filterByAllowance } = req.query;

    try {
        let households;

        if (filterByBalance === "true") {
            households = await userManager.getHouseholdsWithExistingBalances(
                userId
            );
        } else if (filterByAllowance === "true") {
            households = await userManager.getHouseholdsWithExistingAllowances(
                userId
            );
        } else {
            // Handle default case
            households = await userManager.getHouseholdsWithBalances(userId);
        }

        res.status(200).json(households);
    } catch (error) {
        next(error);
    }
});

router.get("/profile", isAuth, async (req, res, next) => {
    const userId = req.userId;

    try {
        const user = await userManager.getProfile(userId);

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});

router.get("/bankDetails", isAuth, async (req, res, next) => {
    const userId = req.userId;
    const payeeId = req.query.payeeId;

    if (!payeeId) {
        return next(new AppError("Няма посочен потребител", 400));
    }

    try {
        const bankDetails = await userManager.getBankDetails(userId, payeeId);

        res.status(200).json(bankDetails);
    } catch (error) {
        next(error);
    }
});

router.put("/profile", isAuth, updateValidator, async (req, res, next) => {
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

    const {
        avatar,
        name,
        email,
        phone,
        oldPassword,
        password,
        repeatPassword,
        bankDetails,
    } = req.body;

    const userId = req.userId;

    try {
        const { token, user } = await userManager.update({
            userId,
            avatar,
            name,
            email,
            phone,
            oldPassword,
            password,
            repeatPassword,
            bankDetails,
        });

        const response = {
            _id: user._id,
            email: user.email,
            birthdate: user.birthdate,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            avatarColor: user.avatarColor,
        };

        // Only add `bankDetails` if it exists
        if (user.bankDetails) {
            response.bankDetails = user.bankDetails;
        }

        res.cookie("auth", token, { httpOnly: true });

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.get("/logout", isAuth, (req, res, next) => {
    try {
        // TODO: invalidate token
        res.clearCookie("auth");

        res.status(200).json({ message: "Успешно отписване от системата" });
    } catch (error) {
        next(error);
    }
});

router.use("/notifications", isAuth, notificationController);
router.use("/reminders", isAuth, reminderController);

module.exports = router;
