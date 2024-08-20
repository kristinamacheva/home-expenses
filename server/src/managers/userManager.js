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

exports.getBankDetails = async (userId, payeeId) => {
    const payer = await User.findById(userId).select("-password").lean();
    const payee = await User.findById(payeeId).select("-password").lean();

    if (!payee) {
        throw new AppError("Не съществува такъв потребител", 401);
    }

    if (!payer.bankDetails) {
        throw new AppError(
            "Не сте позволили извършването на банкови преводи.",
            401
        );
    }

    if (!payee.bankDetails) {
        throw new AppError(
            "Получателят не е позволил извършването на банкови преводи.",
            401
        );
    }

    const bankDetails = {
        payeeIban: payee.bankDetails.iban,
        payeeFullName: payee.bankDetails.fullName,
        payeeBic: payee.bankDetails.bic,
        payerIban: payer.bankDetails.iban,
        payerFullName: payer.bankDetails.fullName,
    };

    return bankDetails;
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
                        cond: {
                            $eq: [
                                "$$bal.user",
                                new mongoose.Types.ObjectId(userId),
                            ],
                        },
                    },
                },
                archived: "$householdDetails.archived",
            },
        },
    ]);
    return result;
};

exports.getHouseholdsWithExistingBalances = async (userId) => {
    const result = await User.aggregate([
        // Filter the User collection to find the user with the given userId
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        // Left outer join with the households collection
        {
            $lookup: {
                from: "households",
                localField: "households",
                foreignField: "_id",
                as: "householdDetails",
            },
        },
        // Deconstructing the householdDetails array
        { $unwind: "$householdDetails" },
        // Filter households where the user is present in the balance array
        {
            $match: {
                "householdDetails.balance.user": new mongoose.Types.ObjectId(
                    userId
                ),
                "householdDetails.archived": false, // Filter out archived households
            },
        },
        // Fetch details of all members in each household
        {
            $lookup: {
                from: "users",
                localField: "householdDetails.members.user",
                foreignField: "_id",
                as: "membersDetails",
            },
        },
        // Project the relevant fields including household ID, name, members, admins, and balance
        {
            $project: {
                _id: "$householdDetails._id",
                name: "$householdDetails.name",
                // Use $map and $let to fetch the name, avatar, and avatarColor from membersDetails
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
                // Use $filter to include only the balance details for the specified user
                balance: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: "$householdDetails.balance",
                                as: "bal",
                                cond: {
                                    $eq: [
                                        "$$bal.user",
                                        new mongoose.Types.ObjectId(userId),
                                    ],
                                },
                            },
                        },
                        0,
                    ],
                },
            },
        },
    ]);

    return result;
};

exports.getHouseholdsWithExistingAllowances = async (userId) => {
    const result = await User.aggregate([
        // Filter the User collection to find the user with the given userId
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        // Left outer join with the households collection
        {
            $lookup: {
                from: "households",
                localField: "households",
                foreignField: "_id",
                as: "householdDetails",
            },
        },
        // Deconstructing the householdDetails array
        { $unwind: "$householdDetails" },
        // Filter households where the user is present in the allowances array
        {
            $match: {
                "householdDetails.allowances.user": new mongoose.Types.ObjectId(
                    userId
                ),
                "householdDetails.archived": false, // Filter out archived households
            },
        },
        // Fetch details of all members in each household
        {
            $lookup: {
                from: "users",
                localField: "householdDetails.members.user",
                foreignField: "_id",
                as: "membersDetails",
            },
        },
        // Project the relevant fields including household ID, name, members, admins, and balance
        {
            $project: {
                _id: "$householdDetails._id",
                name: "$householdDetails.name",
                // Use $map and $let to fetch the name, avatar, and avatarColor from membersDetails
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
                // Use $filter to include only the allowance details for the specified user
                allowances: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: "$householdDetails.allowances",
                                as: "allowance",
                                cond: {
                                    $eq: [
                                        "$$allowance.user",
                                        new mongoose.Types.ObjectId(userId),
                                    ],
                                },
                            },
                        },
                        0,
                    ],
                },
            },
        },
    ]);

    return result;
};

// Function to validate IBAN using AnyAPI
async function validateIban(iban) {
    const apiKey = process.env.ANYAPI_KEY;

    try {
        const response = await fetch(
            `https://anyapi.io/api/v1/iban?iban=${iban}&apiKey=${apiKey}`
        );

        // Check if response is ok
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const result = await response.json();

        // Check if the IBAN is valid
        if (result.valid) {
            return {
                isValidIban: true,
                bic: result.bic?.bic || "", // Extract the BIC from the API response
            };
        }

        return { isValidIban: false };
    } catch (error) {
        console.error("Error validating IBAN:", error);
        throw new AppError("Грешка при валидирането на IBAN.");
    }
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
    bankDetails,
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

    if (bankDetails) {
        const { iban, fullName } = bankDetails;

        // Ensure iban and fullName are provided and not empty
        if (iban && fullName) {
            // Check if IBAN or fullName has changed
            const ibanChanged =
                !user.bankDetails || user.bankDetails.iban !== iban;
            const fullNameChanged =
                !user.bankDetails || user.bankDetails.fullName !== fullName;

            // If IBAN has changed, validate it using the Bank Data API
            if (ibanChanged) {
                const { isValidIban, bic } = await validateIban(iban);

                if (!isValidIban) {
                    throw new AppError("Невалиден IBAN.", 400);
                }

                // Update bank details with the new IBAN and BIC
                user.bankDetails.iban = iban;
                user.bankDetails.bic = bic; // Save the BIC returned by the API
            } else if (fullNameChanged) {
                // If only the fullName has changed, update it without validating IBAN
                user.bankDetails.fullName = fullName;
            }
        } else {
            throw new AppError("IBAN и трите имена са задължителни.", 400);
        }
    } else {
        // If no bankDetails are provided, remove the existing bankDetails
        user.bankDetails = undefined;
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

    // Build the user object
    const userResponse = {
        _id: user._id,
        email: user.email,
        birthdate: user.birthdate,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        avatarColor: user.avatarColor,
    };

    // Only include bankDetails if it exists
    if (user.bankDetails) {
        userResponse.bankDetails = user.bankDetails;
    }

    return {
        token,
        user: userResponse,
    };
}
