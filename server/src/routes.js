const router = require('express').Router();

const householdController = require('./controllers/householdController');
const userController = require('./controllers/userController');

router.use('/households', householdController);
router.use('/users', userController);

module.exports = router;