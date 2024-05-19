const router = require('express').Router();
const householdManager = require('../managers/householdManager')

router.get('/', async (req, res) => {
    // TODO: lean?
    const households = await householdManager.getAll().lean();
    res.json(households);
});

router.post('/', async (req, res) => {
    const {
        name,
        members,
        admin,
        balance,
    } = req.body;

    const newHousehold = await householdManager.create({
        name,
        members,
        admin,
        balance, 
    });

    res.status(201).json(newHousehold);
});

router.get('/:householdId', async (req, res) => {
    // TODO: lean?
    const household = await householdManager.getOneWithUsers(req.params.householdId).lean();
    res.json(household);
});

router.get('/:householdId/reduced', (req, res) => {
    const household = householdManager.getOneReducedData(req.params.householdId);
    res.json(household);
});

module.exports = router;