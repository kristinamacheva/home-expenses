const bcrypt = require('bcrypt');

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

    return user;
};