const bcrypt = require("bcrypt");
const jwt = require("../lib/jwt");

const User = require("../models/User");
const { getRandomColor } = require("../utils/color/color");
const mongoose = require("mongoose");
const { AppError } = require("../utils/AppError");

exports.register = async (userData) => {
    const randomColor = getRandomColor();
    const user = await User.create({ ...userData, avatarColor: randomColor });

    const result = getAuthResult(user);

    return result;
};

exports.login = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("Не съществува такъв имейл или парола", 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new AppError("Не съществува такъв имейл или парола", 401);
    }

    const result = getAuthResult(user);

    return result;
};

exports.getProfile = async (userId) => {
    const user = await User.findById(userId).select("-password").lean();

    return user;
};

// Function to get households and balances for a specific user
exports.getHouseholdsWithBalances = async (userId) => {
    const result = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: "households",
                localField: "households",
                foreignField: "_id",
                as: "householdDetails",
            },
        },
        { $unwind: "$householdDetails" },
        {
            $lookup: {
                from: "users",
                localField: "householdDetails.members.user",
                foreignField: "_id",
                as: "membersDetails",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "householdDetails.balance.user",
                foreignField: "_id",
                as: "balanceDetails",
            },
        },
        {
            $project: {
                _id: "$householdDetails._id",
                name: "$householdDetails.name",
                members: {
                    $map: {
                        input: "$householdDetails.members",
                        as: "member",
                        in: {
                            _id: "$$member.user",
                            role: "$$member.role",
                            name: {
                                $let: {
                                    vars: {
                                        memberDetail: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$membersDetails",
                                                        as: "memberDetail",
                                                        cond: {
                                                            $eq: [
                                                                "$$memberDetail._id",
                                                                "$$member.user",
                                                            ],
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                    in: "$$memberDetail.name",
                                },
                            },
                            avatar: {
                                $let: {
                                    vars: {
                                        memberDetail: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$membersDetails",
                                                        as: "memberDetail",
                                                        cond: {
                                                            $eq: [
                                                                "$$memberDetail._id",
                                                                "$$member.user",
                                                            ],
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                    in: "$$memberDetail.avatar",
                                },
                            },
                            avatarColor: {
                                $let: {
                                    vars: {
                                        memberDetail: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$membersDetails",
                                                        as: "memberDetail",
                                                        cond: {
                                                            $eq: [
                                                                "$$memberDetail._id",
                                                                "$$member.user",
                                                            ],
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                    in: "$$memberDetail.avatarColor",
                                },
                            },
                        },
                    },
                },
                admins: "$householdDetails.admins",
                balance: {
                    $map: {
                        input: "$householdDetails.balance",
                        as: "bal",
                        in: {
                            _id: "$$bal._id",
                            sum: "$$bal.sum",
                            type: "$$bal.type",
                        },
                    },
                },
            },
        },
    ]);
    return result;
 
}

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

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
        throw new AppError("Имейлът е зает.", 400);
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
        throw new AppError("Старата парола е невалидна.", 400);
    }

    user.name = name;
    user.phone = phone;
    user.avatar = avatar;
    user.email = email;

    if (password) {
        user.password = password;
        user.repeatPassword = repeatPassword;
    }

    await user.save();

    const result = getAuthResult(user);

    return result;
};

async function getAuthResult(user) {
    const ACCESS_TOKEN = {
        secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
        expiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY,
    };

    const payload = {
        _id: user._id,
        email: user.email,
    };

    const token = await jwt.sign(payload, ACCESS_TOKEN.secret, {
        expiresIn: ACCESS_TOKEN.expiry,
    });

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
