const User = require('../models/User');

exports.create = async (userData) => {
    User.create(userData);

    return userData;
};