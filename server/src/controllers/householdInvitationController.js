const router = require('express').Router();
const householdInvitationManager = require('../managers/householdInvitationManager');
const { isAuth } = require('../middlewares/authMiddleware');
const getHouseholdInvitation = require('../middlewares/householdInvitationMiddleware');

router.get('/', async (req, res) => {
    // TODO: lean?
    try {
        const userId = req.userId;
        const invitations = await householdInvitationManager.getAll(userId);
        res.json(invitations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching invitations' });
    }
});

router.use('/:invitationId', getHouseholdInvitation);

router.delete('/:invitationId/accept', async (req, res) => {
    // TODO: lean?
    try {
        const userId = req.userId;
        const invitationId = req.invitationId;
        const householdId = await householdInvitationManager.accept(userId, invitationId);
        
        res.json(householdId);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error accepting invitation' });
    }
});

router.delete('/:invitationId/reject', async (req, res) => {
    // TODO: lean?
    try {
        const userId = req.userId;
        const invitationId = req.invitationId;
        const result = await householdInvitationManager.reject(userId, invitationId);
        
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error rejecting invitation' });
    }
});

module.exports = router;
