const router = require('express').Router();

const householdController = require('./controllers/householdController');
const householdInvitationController = require('./controllers/householdInvitationController');
const userController = require('./controllers/userController');
const { isAuth } = require('./middlewares/authMiddleware');

router.use('/households', isAuth, householdController);
router.use('/household-invitations', isAuth, householdInvitationController);
router.use('/users', userController);

module.exports = router;