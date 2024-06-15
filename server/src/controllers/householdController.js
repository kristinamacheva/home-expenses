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
            // admin: req.user._id,
            admin: '664f630fb14becfeb98d2e1f',
        });

        res.status(201).json(newHousehold);
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: 'Cannot create household'
        });
    }
});

router.get('/:householdId', async (req, res) => {
    // TODO: lean?
    const household = await householdManager.getOneWithUsersAndBalance(req.params.householdId).lean();
    console.log(req.user);
    res.json(household);
});

// TODO: better approach
router.get('/:householdId/members', async (req, res) => {
    const { role, details } = req.query;
    let users;

    try {
        if (details === 'true') {
            users = await householdManager.getAllMembersDetails(req.params.householdId);
        } else if (role === 'child') {
            users = await householdManager.getAllChildMembers(req.params.householdId);
        } else if (role === 'not-child') {
            users = await householdManager.getAllNonChildMembers(req.params.householdId);
        } else {
            users = await householdManager.getAllMembers(req.params.householdId);
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching members' });
    }
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