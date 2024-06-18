const router = require('express').Router();

const householdController = require('./controllers/householdController');
const householdInvitationController = require('./controllers/householdInvitationController');
const userController = require('./controllers/userController');

router.use('/households', householdController);
router.use('/household-invitations', householdInvitationController);
router.use('/users', userController);

module.exports = router;