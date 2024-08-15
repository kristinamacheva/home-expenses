const router = require("express").Router();
const householdInvitationManager = require("../managers/householdInvitationManager");
const { isAuth } = require("../middlewares/authMiddleware");
const getHouseholdInvitation = require("../middlewares/householdInvitationMiddleware");
const { AppError } = require("../utils/AppError");

router.get("/", async (req, res, next) => {
    const userId = req.userId;

    try {
        const invitations = await householdInvitationManager.getAll(userId);

        res.status(200).json(invitations);
    } catch (error) {
        next(error);
    }
});

router.use("/:invitationId", getHouseholdInvitation);

router.get("/:invitationId", async (req, res, next) => {
    const userId = req.userId;
    const invitationId = req.invitationId;

    try {
        const invitation = await householdInvitationManager.getOne(
            userId,
            invitationId
        );

        res.status(200).json(invitation);
    } catch (error) {
        next(error);
    }
});

router.delete("/:invitationId/accept", async (req, res, next) => {
    const userId = req.userId;
    const invitationId = req.invitationId;

    try {
        const householdId = await householdInvitationManager.accept(
            userId,
            invitationId
        );

        res.status(200).json({ householdId });
    } catch (error) {
        next(error);
    }
});

router.delete("/:invitationId/reject", async (req, res, next) => {
    const userId = req.userId;
    const invitationId = req.invitationId;

    try {
        await householdInvitationManager.reject(userId, invitationId);

        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
