const jwt = require('../lib/jwt');

exports.auth = async (req, res, next) => {
    const ACCESS_TOKEN = {
        secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
    };

    const token = req.cookies['auth'];

    if (token) {
        try {
            // returns payload
            const decodedToken = await jwt.verify(token, ACCESS_TOKEN.secret);

            req.user = decodedToken;

            next();
        } catch(err) {
            res.clearCookie('auth');
            res.status(401).json({
                message: 'You are not authorized!',
            })
        }
    } else {
        next();
    }
};