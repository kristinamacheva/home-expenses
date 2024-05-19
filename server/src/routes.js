const router = require('express').Router();

const householdController = require('./controllers/householdController');
const userController = require('./controllers/userController');

router.use('/domakinstva', householdController);
router.use('/potrebiteli', userController);

module.exports = router;