const router = require('express').Router();

const userManager = require('../managers/userManager');

router.post('/registraciq', async (req, res) => {
    // TODO: add user data to db
    const {
        name,
        email,
        phone,
        password,
        repeatPassword,
    } = req.body;

    try {
        const newUser = await userManager.register({ name, email, phone, password, repeatPassword });
        res.status(201).json(newUser);
    } catch (err) {
        console.log(err);
    }
});

router.post('/vhod', async (req, res) => {
    const {
        email,
        password,
    } = req.body;

    try {
        const token = await userManager.login({ email, password });

        res.cookie('auth', token, { httpOnly: true });

        // TODO
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;