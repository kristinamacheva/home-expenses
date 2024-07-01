const router = require("express").Router();
const notificationManager = require("../managers/notificationManager");

router.get("/", async (req, res, next) => {
    const userId = req.userId;

    try {
        const notifications = await notificationManager.getAllNotRead(userId);

        res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
});

module.exports = router;

