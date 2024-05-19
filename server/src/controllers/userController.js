const router = require('express').Router();

router.post('/registraciq', (req, res) => {
    // TODO: add user data to db
    const {
        name,
        email,
        phone,
        password,
    } = req.body;

    const newUser = {
        name,
        email,
        phone,
        password,
    };

    console.log(newUser);
    res.json(newUser);
});

module.exports = router;