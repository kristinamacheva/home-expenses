const router = require('express').Router();

const userManager = require('../managers/userManager');

router.post('/registraciq', async (req, res) => {
    // TODO: add user data to db
    const {
        name,
        email,
        phone,
        password,
    } = req.body;

    try {
        const newUser = await userManager.register({ name, email, phone, password, });
        res.status(201).json(newUser);
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;