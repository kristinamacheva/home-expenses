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

exports.getProfile = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        throw new Error("Cannot find user");
    }

    return user;
};

exports.update = async ({
    userId,
    avatar,
    name,
    email,
    phone,
    oldPassword,
    password,
    repeatPassword,
}) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("Cannot find user");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
        throw new Error("Email already exists");
    } 

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
        throw new Error("Cannot update - password is incorrect");
    }

    user.name = name;
    user.phone = phone;
    user.avatar = avatar;
    user.email = email;
    
    // Check if password fields are provided and not empty
    if (password && password !== '') {
        // Check if repeatPassword is provided
        if (repeatPassword && repeatPassword !== '') {
            user.password = password;
            user.repeatPassword = repeatPassword;
        } else {
            throw new Error("Passwords do not match");
        }
    }

    await user.save();

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
