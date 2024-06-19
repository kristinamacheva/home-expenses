const router = require('express').Router();
const householdInvitationManager = require('../managers/householdInvitationManager');
const { isAuth } = require('../middlewares/authMiddleware');

router.get('/', isAuth, async (req, res) => {
    // TODO: lean?
    try {
        const userId = req.user._id;
        const invitations = await householdInvitationManager.getAll(userId);
        res.json(invitations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching invitations' });
    }
});

router.delete('/:invitationId/accept', isAuth, async (req, res) => {
    // TODO: lean?
    try {
        const userId = req.user._id;
        const invitationId = req.params.invitationId;
        const householdId = await householdInvitationManager.accept(userId, invitationId);
        
        res.json(householdId);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error accepting invitation' });
    }
});

router.delete('/:invitationId/reject', isAuth, async (req, res) => {
    // TODO: lean?
    try {
        const userId = req.user._id;
        const invitationId = req.params.invitationId;
        const result = await householdInvitationManager.reject(userId, invitationId);
        
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error rejecting invitation' });
    }
});

module.exports = router;
