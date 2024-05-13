const router = require('express').Router();

const householdManager = require('../managers/householdManager')

router.get('/', (req, res) => {
    const households = householdManager.getAll();
    res.json(households);
});

router.post('/', (req, res) => {
    const {
        name,
        members,
        admin,
    } = req.body;

    const newHousehold = householdManager.create({
        name,
        members,
        admin,
    });

    res.status(201).json(newHousehold);
});

router.get('/:householdId', (req, res) => {
    const household = householdManager.getOne(req.params.householdId);
    res.json(household);
});

router.get('/:householdId/reduced', (req, res) => {
    const household = householdManager.getOneReducedData(req.params.householdId);
    res.json(household);
});

module.exports = router;