const Household = require("../models/Household");
const User = require("../models/User");
const PaidExpense = require("../models/PaidExpense");
const Notification = require("../models/Notification");
const { AppError } = require("../utils/AppError");
const { default: mongoose } = require("mongoose");
const Payment = require("../models/Payment");
const { sendNotificationToUser } = require("../config/socket");

const { ObjectId } = require("mongoose").Types;

exports.getAll = async (userId, householdId, page, limit, searchParams) => {
    const skip = (page - 1) * limit;

    // Build dynamic match conditions based on search parameters
    let matchConditions = { household: new ObjectId(householdId) };

    // Date range filter
    if (searchParams.startDate && searchParams.endDate) {
        matchConditions.date = {
            $gte: new Date(searchParams.startDate),
            $lte: new Date(searchParams.endDate),
        };
    } else if (searchParams.startDate) {
        matchConditions.date = { $gte: new Date(searchParams.startDate) };
    } else if (searchParams.endDate) {
        matchConditions.date = { $lte: new Date(searchParams.endDate) };
    }

    // Payment status conditions
    let paymentStatusConditions = [];

    // If approved is explicitly false, filter out "Одобрен"
    if (searchParams.approved === false)
        paymentStatusConditions.push("Одобрен");

    // If forApproval is explicitly false, filter out "За одобрение"
    if (searchParams.forApproval === false)
        paymentStatusConditions.push("За одобрение");

    // If rejected is explicitly false, filter out "Отхвърлен"
    if (searchParams.rejected === false)
        paymentStatusConditions.push("Отхвърлен");

    // If there are any conditions to filter out, add them to the match
    if (paymentStatusConditions.length > 0) {
        matchConditions.paymentStatus = { $nin: paymentStatusConditions };
    }

    // Aggregation pipeline to fetch payments
    const pipeline = [
        { $match: matchConditions }, // Match documents with dynamic conditions
        { $sort: { date: -1, _id: -1 } }, // Sort by date and _id in descending order
        { $skip: skip }, // Pagination: Skip records
        { $limit: limit }, // Pagination: Limit records
        // Lookup for payer details
        {
            $lookup: {
                from: "users",
                localField: "payer",
                foreignField: "_id",
                as: "payerDetails",
            },
        },
        // Lookup for payee details
        {
            $lookup: {
                from: "users",
                localField: "payee",
                foreignField: "_id",
                as: "payeeDetails",
            },
        },
        // Unwind the payer and payee details arrays
        { $unwind: "$payerDetails" },
        { $unwind: "$payeeDetails" },
        {
            $project: {
                _id: 1,
                amount: 1,
                date: 1,
                paymentStatus: 1, // Ensure the status field is included
                payer: {
                    _id: "$payerDetails._id",
                    name: "$payerDetails.name",
                    avatar: "$payerDetails.avatar",
                    avatarColor: "$payerDetails.avatarColor",
                },
                payee: {
                    _id: "$payeeDetails._id",
                    name: "$payeeDetails.name",
                    avatar: "$payeeDetails.avatar",
                    avatarColor: "$payeeDetails.avatarColor",
                },
            },
        },
    ];

    // Execute aggregation pipeline
    const payments = await Payment.aggregate(pipeline);

    // Count total number of documents matching the conditions
    const totalCount = await Payment.countDocuments(matchConditions);

    return { payments, totalCount };
};

exports.getOne = (paymentId) =>
    Payment.findById(paymentId)
        .select("_id payer payee amount date paymentStatus")
        .populate("payee", "_id name avatar avatarColor")
        .lean();

// exports.getOne = (paymentId) =>
//     Payment.findById(paymentId)
//         .select("_id payer payee amount date paymentStatus")
//         .lean();

// TODO: test
exports.getOneWithBalance = async (paymentId) => {
    // Retrieve payment details including household
    const payment = await Payment.findById(paymentId)
        .select("_id payer payee amount date paymentStatus household")
        .populate("payee", "_id name avatar avatarColor")
        .lean();

    // Retrieve payer and payee IDs
    const payerId = payment.payer;
    const payeeId = payment.payee._id;
    const householdId = payment.household;

    // Define aggregation pipeline to find balances for payer and payee within the household
    const aggregationPipeline = [
        {
            $match: { _id: new ObjectId(householdId) },
        },
        {
            $project: {
                payerBalance: {
                    // get the first element from the filtered balance array
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: "$balance",
                                as: "balance",
                                cond: {
                                    $eq: [
                                        "$$balance.user",
                                        new ObjectId(payerId),
                                    ],
                                },
                            },
                        },
                        0,
                    ],
                },
                payeeBalance: {
                    // get the first element from the filtered balance array
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: "$balance",
                                as: "balance",
                                cond: {
                                    $eq: [
                                        "$$balance.user",
                                        new ObjectId(payeeId),
                                    ],
                                },
                            },
                        },
                        0,
                    ],
                },
            },
        },
    ];

    // Perform aggregation on Household collection
    const results = await Household.aggregate(aggregationPipeline);

    // Check if payer balance was not found
    if (!results[0]?.payerBalance) {
        throw new AppError("Балансът на платеца не е намерен.", 404);
    }

    // Check if payee balance was not found
    if (!results[0]?.payeeBalance) {
        throw new AppError("Балансът на получателя не е намерен.", 404);
    }

    // Extract balance sums and types from aggregation results
    const payerBalance = results[0].payerBalance;
    const payeeBalance = results[0].payeeBalance;

    // Check if balance type has changed
    if (payerBalance.type !== "-" || payeeBalance.type !== "+") {
        throw new AppError(
            "Има промени в баланса. Не може да се осъществи плащане.",
            400
        );
    }

    // Calculate final balance sums considering the balance type
    const payerBalanceSum = payerBalance.sum;
    const payeeBalanceSum = payeeBalance.sum;

    // Add balance sums to the payment object
    return {
        ...payment,
        payerBalanceSum,
        payeeBalanceSum,
    };
};

exports.getOneDetails = async (paymentId, userId) => {
    const payment = await Payment.findById(paymentId)
        .populate("payer", "_id name avatar avatarColor")
        .populate("payee", "_id name avatar avatarColor")
        .populate("comments.user", "_id name avatar avatarColor")
        .lean();

    return payment;
};

exports.create = async (paymentData) => {
    const { payer, payee, amount, date, household } = paymentData;

    // Fetch the household by ID
    const paymentHousehold = await Household.findById(household);

    // Check if payer and payee are members of the household
    const householdMemberIds = paymentHousehold.members.map((member) =>
        member.user.toString()
    );
    if (!householdMemberIds.includes(payer.toString())) {
        throw new AppError(`Платецът не е член на домакинството`, 403);
    }
    if (!householdMemberIds.includes(payee.toString())) {
        throw new AppError(`Получателят не е член на домакинството`, 403);
    }

    // Check the payer's and payee's balance
    const payerBalance = paymentHousehold.balance.find(
        (entry) => entry.user.toString() === payer.toString()
    );
    const payeeBalance = paymentHousehold.balance.find(
        (entry) => entry.user.toString() === payee.toString()
    );

    if (!payerBalance || payerBalance.type !== "-") {
        throw new AppError("Платецът трябва да има отрицателен баланс", 400);
    }
    if (!payeeBalance || payeeBalance.type !== "+") {
        throw new AppError("Получателят трябва да има положителен баланс", 400);
    }

    // Convert amounts to cents
    const amountInCents = Math.round(amount * 100);
    const payerBalanceInCents = Math.round(payerBalance.sum * 100);
    const payeeBalanceInCents = Math.round(payeeBalance.sum * 100);

    // Check if the amount is valid
    if (amountInCents > payerBalanceInCents) {
        throw new AppError(
            "Сумата на плащането надвишава баланса на платеца",
            400
        );
    }
    if (amountInCents > payeeBalanceInCents) {
        throw new AppError(
            "Сумата на плащането надвишава баланса на получателя",
            400
        );
    }

    // Create the new payment
    const newPayment = new Payment({
        payer,
        payee,
        amount: Number((amountInCents / 100).toFixed(2)), // Store the amount in the standard currency unit
        date,
        household,
    });

    // Save the payment to the database
    await newPayment.save();

    // Create notification for the payee
    const notification = new Notification({
        userId: payee,
        message: `Създадено е ново плащане за Вас в домакинство ${paymentHousehold.name}`,
        household: paymentHousehold._id,
        resourceType: "Payment",
        resourceId: newPayment._id,
    });

    const savedNotification = await notification.save();

    // Send notification to the user if they have an active connection
    sendNotificationToUser(payee, savedNotification);

    return newPayment;
};

exports.accept = async (userId, paymentId) => {
    const payment = await Payment.findById(paymentId);

    // Check if the payment status is "За одобрение"
    if (payment.paymentStatus !== "За одобрение") {
        throw new AppError(
            `Статусът на плащането трябва да бъде "За одобрение" за да може да се одобри`,
            400
        );
    }

    // Check if the user accepting is the payee
    if (!payment.payee.equals(userId)) {
        throw new AppError("Само получателят може да одобри плащането", 403);
    }

    // Fetch the household by ID
    const household = await Household.findById(payment.household);

    // Get payer and payee balance
    const payerBalance = household.balance.find((entry) =>
        entry.user.equals(payment.payer)
    );
    const payeeBalance = household.balance.find((entry) =>
        entry.user.equals(payment.payee)
    );

    if (!payerBalance || payerBalance.type !== "-") {
        throw new AppError("Платецът трябва да има отрицателен баланс", 400);
    }
    if (!payeeBalance || payeeBalance.type !== "+") {
        throw new AppError("Получателят трябва да има положителен баланс", 400);
    }

    // Convert amount to cents for accuracy
    const amountInCents = Math.round(payment.amount * 100);

    // Check if the amount is still valid
    let payerBalanceInCents = Math.round(payerBalance.sum * 100);
    let payeeBalanceInCents = Math.round(payeeBalance.sum * 100);

    if (amountInCents > payerBalanceInCents) {
        throw new AppError(
            "Сумата на плащането надвишава баланса на платеца",
            400
        );
    }
    if (amountInCents > payeeBalanceInCents) {
        throw new AppError(
            "Сумата на плащането надвишава баланса на получателя",
            400
        );
    }

    // Subtract the amount from both balances
    payerBalanceInCents -= amountInCents;
    payeeBalanceInCents -= amountInCents;

    // Update the balances in the household document
    payerBalance.sum = Number((payerBalanceInCents / 100).toFixed(2));
    payeeBalance.sum = Number((payeeBalanceInCents / 100).toFixed(2));

    // Update payer's balance type if their balance sum is now zero
    if (payerBalance.sum === 0) {
        payerBalance.type = "+";
    }

    // Update payment status to approved
    payment.paymentStatus = "Одобрен";

    // Save the updated household and payment to the database
    await household.save();
    await payment.save();

    // Create notification for the payer
    const notification = new Notification({
        userId: payment.payer,
        message: `Одобрено е създадено от Вас плащане в домакинство ${household.name}`,
        household: household._id,
        resourceType: "Payment",
        resourceId: payment._id,
    });

    const savedNotification = await notification.save();

    // Send notification to the user if they have an active connection
    sendNotificationToUser(payment.payer, savedNotification);

    return payment;
};

exports.reject = async (userId, paymentId, text) => {
    const payment = await Payment.findById(paymentId);

    // Check if the payment status is "За одобрение"
    if (payment.paymentStatus !== "За одобрение") {
        throw new AppError(
            `Статусът на плащането трябва да бъде "За одобрение" за да може да се одобри`,
            400
        );
    }

    // Check if the user accepting is the payee
    if (!payment.payee.equals(userId)) {
        throw new AppError("Само получателят може да отхвърли плащането", 403);
    }

    // Update status to "Отхвърлен"
    payment.paymentStatus = "Отхвърлен";

    // Add the rejection reason as a comment
    payment.comments.push({
        user: userId,
        text: `Причина за отхвърляне: ${text}`,
        createdAt: new Date(),
    });

    // Save the updated payment to the database
    await payment.save();

    // Create notification for the payer
    const notification = new Notification({
        userId: payment.payer,
        message: `Отхвърлено е създадено от Вас плащане.`,
        household: payment.household,
        resourceType: "Payment",
        resourceId: payment._id,
    });

    const savedNotification = await notification.save();

    // Send notification to the user if they have an active connection
    sendNotificationToUser(payment.payer, savedNotification);
};

exports.addComment = async (userId, paymentId, text) => {
    // Create a comment object
    const comment = {
        user: userId,
        text: text,
        createdAt: new Date(),
    };

    // Update the Payment document by adding the comment and then fetching
    // the updated document with populated user fields in comments
    const updatedPayment = await Payment.findByIdAndUpdate(
        paymentId,
        { $push: { comments: comment } },
        { new: true } // Return the updated document
    ).populate({
        path: "comments.user",
        select: "name avatar avatarColor",
    });

    // Return the populated comments array
    return updatedPayment.comments;
};

exports.update = async (paymentData) => {
    const { userId, paymentId, amount, date } = paymentData;

    // Fetch the existing payment
    const existingPayment = await Payment.findById(paymentId);

    // Check if the user making the request is the payer
    const payerId = existingPayment.payer.toString();
    if (userId.toString() !== payerId) {
        throw new AppError("Само платецът може да редактира плащането", 403);
    }

    // Check if the payment status is Отхвърлен
    if (existingPayment.paymentStatus !== "Отхвърлен") {
        throw new AppError(
            "Само плащания със статус Отхвърлен могат да бъдат редактирани",
            400
        );
    }

    // Fetch the household by ID
    const paymentHousehold = await Household.findById(
        existingPayment.household
    );

    // Retrieve payee ID from the existing payment
    const payeeId = existingPayment.payee.toString();

    // Check the payer's and payee's balance
    const payerBalance = paymentHousehold.balance.find(
        (entry) => entry.user.toString() === payerId
    );
    const payeeBalance = paymentHousehold.balance.find(
        (entry) => entry.user.toString() === payeeId
    );

    if (!payerBalance || payerBalance.type !== "-") {
        throw new AppError("Платецът трябва да има отрицателен баланс", 400);
    }
    if (!payeeBalance || payeeBalance.type !== "+") {
        throw new AppError("Получателят трябва да има положителен баланс", 400);
    }

    // Convert amounts to cents
    const amountInCents = Math.round(amount * 100);
    const payerBalanceInCents = Math.round(payerBalance.sum * 100);
    const payeeBalanceInCents = Math.round(payeeBalance.sum * 100);

    // Check if the amount is valid
    if (amountInCents > payerBalanceInCents) {
        throw new AppError(
            "Сумата на плащането надвишава баланса на платеца",
            400
        );
    }
    if (amountInCents > payeeBalanceInCents) {
        throw new AppError(
            "Сумата на плащането надвишава баланса на получателя",
            400
        );
    }

    // Update the payment details and set the status to За одобрение
    existingPayment.amount = Number((amountInCents / 100).toFixed(2)); // Store the amount in the standard currency unit
    existingPayment.date = date;
    existingPayment.paymentStatus = "За одобрение";

    // Save the updated payment to the database
    await existingPayment.save();
};

exports.delete = async (userId, paymentId) => {
    // Fetch the existing payment
    const existingPayment = await Payment.findById(paymentId);

    // Check if the user making the request is the payer
    const payerId = existingPayment.payer.toString();
    if (userId.toString() !== payerId) {
        throw new AppError("Само платецът може да изтрива плащането", 403);
    }

    // Check if the payment status is Отхвърлен
    if (existingPayment.paymentStatus !== "Отхвърлен") {
        throw new AppError(
            "Само плащания със статус Отхвърлен могат да бъдат изтривани",
            400
        );
    }

    // Delete the existing payment from the database
    await Payment.findByIdAndDelete(paymentId);
};
