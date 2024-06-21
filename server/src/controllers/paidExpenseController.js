const router = require("express").Router();
const paidExpenseManager = require("../managers/paidExpenseManager");
const { isAuth } = require('../middlewares/authMiddleware');
const getPaidExpense = require("../middlewares/paidExpenseMiddleware");

router.get("/", async (req, res) => {
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

router.post("/", async (req, res) => {
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

    const parsedPaid = paid.map((entry) => ({
        user: entry._id,
        sum: parseFloat(entry.sum),
    }));

    const parsedOwed = owed.map((entry) => ({
        user: entry._id,
        sum: parseFloat(entry.sum),
    }));

    const parsedAmount = parseFloat(amount);

    try {
        const newPaidExpense = await paidExpenseManager.create({
            title,
            category,
            creator: req.userId,
            // creator: '664f630fb14becfeb98d2e1f',
            amount: parsedAmount,
            date,
            paidSplitType,
            paid: parsedPaid,
            owedSplitType,
            owed: parsedOwed,
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

router.use('/:paidExpenseId', getPaidExpense);

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
