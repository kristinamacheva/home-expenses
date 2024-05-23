const User = require('../models/User');

exports.register = (userData) => {
    const user = new User(userData);
    return user.save();
};