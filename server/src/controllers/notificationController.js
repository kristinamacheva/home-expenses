const router = require("express").Router();
const notificationManager = require("../managers/notificationManager");
const getNotification = require("../middlewares/notificationMiddleware");

router.get("/", async (req, res, next) => {
    const userId = req.userId;

    try {
        const notifications = await notificationManager.getAllNotRead(userId);

        res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
});

router.put("/markAllAsRead", async (req, res, next) => {
    const userId = req.userId;

    try {
        await notificationManager.markAllAsRead(userId);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

router.use("/:notificationId", getNotification);

router.delete("/:notificationId", async (req, res, next) => {
    const notificationId = req.notificationId;

    try {
        await notificationManager.delete(notificationId);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;

