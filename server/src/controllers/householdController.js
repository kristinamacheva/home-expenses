const router = require('express').Router();
const householdManager = require('../managers/householdManager');
const getHousehold = require('../middlewares/householdMiddleware');
const paidExpenseController = require('./paidExpenseController');

router.get('/', async (req, res) => {
    // TODO: lean?
    try {
        const userId = req.user._id;
        const households = await householdManager.getAllWithUsers(userId);
        res.json(households);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching households' });
    }
});

router.post('/', async (req, res) => {
    const {
        name,
        members,
    } = req.body;

    try {
        const newHousehold = await householdManager.create({
            name,
            members,
            admin: req.user._id,
        });
    
        res.status(201).json(newHousehold);
    } catch (err) {
        res.status(400).json({
            message: 'Cannot create household'
        });
    }
});

router.get('/:householdId', async (req, res) => {
    // TODO: lean?
    const household = await householdManager.getOneWithUsers(req.params.householdId).lean();
    console.log(req.user);
    res.json(household);
});

router.get('/:householdId/reduced', async (req, res) => {
    const household = await householdManager.getOneReducedData(req.params.householdId);
    res.json(household);
});

// TODO: update status
router.put('/:householdId', async (req, res) => {
    const household = await householdManager.update(req.params.householdId, req.body);
    res.json(household);
});

router.delete('/:householdId', async (req, res) => {
    await householdManager.delete(req.params.householdId);
    // TODO: result
    res.status(204).end();
});

router.use('/:householdId/paidExpenses', getHousehold, paidExpenseController);

module.exports = router;