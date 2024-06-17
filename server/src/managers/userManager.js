const bcrypt = require("bcrypt");
const jwt = require("../lib/jwt");
const { SECRET } = require("../config/config");

const User = require("../models/User");
const { getRandomColor } = require("../utils/color/color");

exports.register = async (userData) => {
    const randomColor = getRandomColor();
    const user = await User.create({ ...userData, avatarColor: randomColor });

    const result = getAuthResult(user);

    return result;
};

exports.login = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Cannot find email or password");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new Error("Cannot find email or password");
    }

    const result = getAuthResult(user);

    return result;
};

async function getAuthResult(user) {
    const payload = {
        _id: user._id,
        email: user.email,
    };

    const token = await jwt.sign(payload, SECRET, { expiresIn: "2d" });

    return {
        token,
        user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            avatarColor: user.avatarColor,
        },
    };
}
