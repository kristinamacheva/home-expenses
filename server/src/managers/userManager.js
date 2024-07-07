const bcrypt = require("bcrypt");
const jwt = require("../lib/jwt");

const User = require("../models/User");
const { getRandomColor } = require("../utils/color/color");
const mongoose = require("mongoose");
const { AppError } = require("../utils/AppError");
const cloudinary = require("cloudinary").v2;

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

// Function to get households and balance for a specific user
exports.getHouseholdsWithBalances = async (userId) => {
    const result = await User.aggregate([
        // filter the User collection to find the user with the given userId
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        // left outer join with the households collection
        // matches the households field in the User document with the _id field in the households collection
        {
            $lookup: {
                from: "households",
                localField: "households",
                foreignField: "_id",
                as: "householdDetails",
            },
        },
        // deconstructing the householdDetails array and outputting a document for each household in 
        // which the user is a member
        { $unwind: "$householdDetails" },
        // fetch details of all members in each household
        {
            $lookup: {
                from: "users",
                localField: "householdDetails.members.user",
                foreignField: "_id",
                as: "membersDetails",
            },
        },
        // Project the relevant fields including household ID, name, members, admins, and balance.
        {
            $project: {
                _id: "$householdDetails._id",
                name: "$householdDetails.name",
                // use $map and $let to fetch the name, avatar, and avatarColor from membersDetails
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
                // use $filter to include only the balance details for the specified user
                balance: {
                    $filter: {
                        input: "$householdDetails.balance",
                        as: "bal",
                        cond: { $eq: ["$$bal.user", new mongoose.Types.ObjectId(userId)] },
                    },
                },
            },
        },
    ]);
    return result;
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
    user.email = email;

    if (password) {
        user.password = password;
        user.repeatPassword = repeatPassword;
    }

    if (avatar) {
        if (user.avatar !== "") {
            await cloudinary.uploader.destroy(
                user.avatar.split("/").pop().split(".")[0]
            );
        }

        const uploadedResponse = await cloudinary.uploader.upload(avatar);
        user.avatar = uploadedResponse.secure_url;
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
