const bcrypt = require('bcrypt');
const jwt = require('../lib/jwt');
const { SECRET } = require('../config/config');

const User = require('../models/User');

exports.register = (userData) => {
    const user = new User(userData);
    return user.save();
};

exports.login = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Cannot find email or password');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new Error('Cannot find email or password');
    }

    const payload = {
        _id: user._id,
        email: user.email,
    }

    const token = await jwt.sign(payload, SECRET, { expiresIn: '2d'});

    return token;
};