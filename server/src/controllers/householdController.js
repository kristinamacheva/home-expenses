const router = require('express').Router();
const householdManager = require('../managers/householdManager');
const getHousehold = require('../middlewares/householdMiddleware');
const paidExpenseController = require('./paidExpenseController');
const { isAuth } = require('../middlewares/authMiddleware');
const getPaidExpense = require('../middlewares/paidExpenseMiddleware');

router.get('/', async (req, res) => {
    // TODO: lean?
    try {
        const userId = req.userId
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
            admin: req.userId,
            // admin: '664f630fb14becfeb98d2e1f',
        });

        res.status(201).json(newHousehold);
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: 'Cannot create household'
        });
    }
});

// Middleware to get householdId
router.use('/:householdId', getHousehold);

router.get('/:householdId', async (req, res) => {
    // TODO: lean?
    const householdId = req.householdId;

    const household = await householdManager.getOneWithUsersAndBalance(householdId).lean();
    res.json(household);
});

// TODO: better approach
router.get('/:householdId/members', async (req, res) => {
    const { role, details } = req.query;
    let users;
    const householdId = req.householdId;

    try {
        if (details === 'true') {
            users = await householdManager.getAllMembersDetails(householdId);
        } else if (role === 'child') {
            users = await householdManager.getAllChildMembers(householdId);
        } else if (role === 'not-child') {
            users = await householdManager.getAllNonChildMembers(householdId);
        } else {
            users = await householdManager.getAllMembers(householdId);
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching members' });
    }
});

router.get('/:householdId/balances', async (req, res) => {
    const { details } = req.query;
    let balances;
    const householdId = req.householdId;

    try {
        if (details === 'true') {
            balances = await householdManager.getAllBalancesDetails(householdId);
        } else {
            balances = await householdManager.getAllBalances(householdId);
        }

        res.json(balances);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching balances' });
    }
});

router.get('/:householdId/reduced', async (req, res) => {
    const householdId = req.householdId;

    const household = await householdManager.getOneReducedData(householdId);
    res.json(household);
});

// TODO: update status
router.put('/:householdId', async (req, res) => {
    const householdId = req.householdId;

    const household = await householdManager.update(householdId, req.body);
    res.json(household);
});

router.delete('/:householdId', async (req, res) => {
    const householdId = req.householdId;

    await householdManager.delete(householdId);
    // TODO: result
    res.status(204).end();
});

router.put('/:householdId/leave', async (req, res) => {
    try {
        const userId = req.userId;
        const householdId = req.householdId;
        const result = await householdManager.leave(userId, householdId);
        res.status(200).json({
            message: 'Successfully left the household',
        });
    } catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            // Fallback to a generic server error
            console.error('Error in leaving household:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

router.use('/:householdId/paidExpenses', getPaidExpense, paidExpenseController);

module.exports = router;