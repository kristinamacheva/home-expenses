const router = require('express').Router();

const userManager = require('../managers/userManager');

router.post('/register', async (req, res) => {
    // TODO: add user data to db
    const {
        name,
        email,
        phone,
        password,
        repeatPassword,
    } = req.body;

    try {
        // TODO: user login
        const { token, user } = await userManager.register({ name, email, phone, password, repeatPassword });

        res.cookie('auth', token, { httpOnly: true });

        res.status(200).json({ 
            _id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone, 
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({ 
            message: 'Some error' ,
        });
    }
});

router.post('/login', async (req, res) => {
    const {
        email,
        password,
    } = req.body;

    try {
        const { token, user } = await userManager.login({ email, password });

        res.cookie('auth', token, { httpOnly: true });

        // TODO
        res.status(200).json({ 
            _id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone, 
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({ 
            message: 'Some error' ,
        });
    }
});

router.get('/logout', (req, res) => {
    try {
        // TODO: invalidate token
        res.clearCookie('auth');
        
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Logout failed' });
    }
});

module.exports = router;