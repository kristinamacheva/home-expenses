const jwt = require('../lib/jwt');
const User = require("../models/User");
const mongoose = require('mongoose');

exports.auth = async (req, res, next) => {
    const ACCESS_TOKEN = {
        secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
    };

    const token = req.cookies['auth'];

    if (token) {
        try {
            // returns payload
            const decodedToken = await jwt.verify(token, ACCESS_TOKEN.secret);

            if (!mongoose.Types.ObjectId.isValid(decodedToken._id)) {
                return res.status(400).json({ message: 'Invalid user ID format' });
            }

            // TODO: req.user = decodedToken or user?
            // Query the database to check if the user exists 
            const user = await User.findById(decodedToken._id);
            if (!user) {
                // Clear the cookie and return a 401 response
                res.clearCookie('auth');
                return res.status(401).json({
                    message: 'You are not authorized!',
                })
            }

            req.userId = decodedToken._id; // Attach user ID to the request object

            next();
        } catch(err) {
            res.clearCookie('auth');
            return res.status(401).json({
                message: 'You are not authorized!',
            })
        }
    } else {
        next();
    }
};

// checks if you are authenticated
exports.isAuth = (req, res, next) => {
    if (!req.userId) {
        return res.status(401).json({
            message: 'You are not authorized!',
        })
    }

    next();
};