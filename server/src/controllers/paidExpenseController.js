const router = require("express").Router();
const paidExpenseManager = require("../managers/paidExpenseManager");
const { isAuth } = require('../middlewares/authMiddleware');

router.get("/", isAuth, async (req, res) => {
    try {
        const householdId = req.householdId;
        const paidExpneses = await paidExpenseManager.getAll(householdId);
        res.json(paidExpneses);
    } catch (error) {
        console.error(error);
        // TODO: status
        res.status(500).json({ message: "Error fetching paid expenses" });
    }
});

router.post("/", isAuth, async (req, res) => {
    const {
        title,
        category,
        amount,
        date,
        paidSplitType,
        paid,
        owedSplitType,
        owed,
    } = req.body;

    try {
        const newPaidExpense = await paidExpenseManager.create({
            title,
            category,
            // creator: req.user._id,
            creator: '664f630fb14becfeb98d2e1f',
            amount,
            date,
            paidSplitType,
            paid,
            owedSplitType,
            owed,
            household: req.householdId,
        });

        res.status(201).json(newPaidExpense);
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "Cannot create paid expense",
        });
    }
});

// router.get('/:paidExpenseId', async (req, res) => {
//     // TODO: lean?
//     const paidExpense = await paidExpenseManager.getOne(req.params.paidExpenseId).lean();
//     console.log(req.user);
//     res.json(paidExpense);
// });

// router.put('/:paidExpenseId', async (req, res) => {
//     const paidExpense = await paidExpenseManager.update(req.params.paidExpenseId, req.body);
//     res.json(paidExpense);
// });

// router.delete('/:paidExpenseId', async (req, res) => {
//     await paidExpenseManager.delete(req.params.paidExpenseId);
//     // TODO: result
//     res.status(204).end();
// });

module.exports = router;
