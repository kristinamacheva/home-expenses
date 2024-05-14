const router = require('express').Router();

const householdController = require('./controllers/householdController');

router.use('/domakinstva', householdController);

module.exports = router;