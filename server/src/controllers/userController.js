const router = require('express').Router();

const { validationResult } = require('express-validator');
const userManager = require('../managers/userManager');
const { isAuth } = require('../middlewares/authMiddleware');
const { loginValidator, registerValidator } = require('../validators/userValidator');

router.post('/register', registerValidator, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(400).json({
            message: 'Данните са некоректни',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

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
            avatar: user.avatar, 
            avatarColor: user.avatarColor, 
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({ 
            message: 'Some error' ,
        });
    }
});

router.post('/login', loginValidator, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(400).json({
            message: 'Данните са некоректни',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    const {
        email,
        password,
    } = req.body;

    try {
        const { token, user } = await userManager.login({ email, password });

        res.cookie('auth', token, { httpOnly: true });

        // TODO -status codes
        res.status(200).json({ 
            _id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone, 
            avatarColor: user.avatarColor, 
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({ 
            message: 'Some error' ,
        });
    }
});

router.get('/profile', isAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userManager.getProfile(userId);

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

router.put('/profile', isAuth, async (req, res) => {
    try {
        const {
            avatar,
            name,
            email,
            phone,
            oldPassword,
            password,
            repeatPassword,
        } = req.body;

        const userId = req.userId;

        const { token, user } = await userManager.update({ userId, avatar, name, email, phone, oldPassword, password, repeatPassword });

        res.cookie('auth', token, { httpOnly: true });

        res.status(200).json({ 
            _id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone, 
            avatar: user.avatar, 
            avatarColor: user.avatarColor, 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating user profile' });
    }
});

router.get('/logout', isAuth, (req, res) => {
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