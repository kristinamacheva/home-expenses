const Household = require("../models/Household");
const User = require("../models/User");
const PaidExpense = require("../models/PaidExpense");
const { AppError } = require("../utils/AppError");
const { default: mongoose } = require("mongoose");

const { ObjectId } = require("mongoose").Types;

exports.getAll = async (userId, householdId, page, limit, searchParams) => {
    const skip = (page - 1) * limit;

    // Build dynamic match conditions based on search parameters
    let matchConditions = { household: new ObjectId(householdId) };

    if (searchParams.title) {
        matchConditions.title = {
            $regex: new RegExp(searchParams.title, "i"),
        }; // Case-insensitive search
    }

    if (searchParams.category) {
        matchConditions.category = {
            $regex: new RegExp(searchParams.category, "i"),
        }; // Case-insensitive search
    }

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

    // Expense status conditions
    let expenseStatusConditions = [];

    // If approved is explicitly false, filter out "Одобрен"
    if (searchParams.approved === false)
        expenseStatusConditions.push("Одобрен");

    // If forApproval is explicitly false, filter out "За одобрение"
    if (searchParams.forApproval === false)
        expenseStatusConditions.push("За одобрение");

    // If rejected is explicitly false, filter out "Отхвърлен"
    if (searchParams.rejected === false)
        expenseStatusConditions.push("Отхвърлен");

    // If there are any conditions to filter out, add them to the match
    if (expenseStatusConditions.length > 0) {
        matchConditions.expenseStatus = { $nin: expenseStatusConditions };
    }

    // Aggregation pipeline to fetch paid expenses and filter balance array
    const pipeline = [
        { $match: matchConditions }, // Match documents with dynamic conditions
        { $sort: { date: -1, _id: -1 } }, // Sort by date and _id in descending order
        { $skip: skip }, // Pagination: Skip records
        { $limit: limit }, // Pagination: Limit records
        {
            $addFields: {
                balance: {
                    $filter: {
                        input: "$balance",
                        as: "entry",
                        cond: {
                            $eq: ["$$entry.user", new ObjectId(userId)],
                        }, // Filter by userId
                    },
                },
            },
        },
        {
            $project: {
                _id: 1,
                title: 1,
                category: 1,
                creator: 1,
                amount: 1,
                date: 1,
                expenseStatus: 1, // Ensure the status field is included
                balance: 1,
            },
        },
    ];

    // Execute aggregation pipeline
    const paidExpenses = await PaidExpense.aggregate(pipeline);

    // Count total number of documents matching the conditions
    const totalCount = await PaidExpense.countDocuments(matchConditions);

    return { paidExpenses, totalCount };
};

exports.getTotalAmountStats = async (householdId, userId, searchParams) => {
    // Check if the user belongs to the household
    const user = await User.findOne({ _id: userId, households: householdId });
    if (!user) {
        throw new AppError(`Потребителят не е част от домакинството`, 401);
    }

    // Proceed with querying the total amount statistics
    const { startDate, endDate } = searchParams;

    const expenses = await PaidExpense.aggregate([
        {
            $match: {
                household: new mongoose.Types.ObjectId(householdId), // Filter by householdId
                date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                expenseStatus: "Одобрен",
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$date" } }, // Group key
                totalAmount: { $sum: "$amount" },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    return expenses.map((e) => ({ date: e._id, amount: e.totalAmount }));
};

exports.getTotalAmountByCategoryStats = async (householdId, userId, searchParams) => {
    // Check if the user belongs to the household
    const user = await User.findOne({ _id: userId, households: householdId });
    if (!user) {
        throw new AppError(`Потребителят не е част от домакинството`, 401);
    }

    // Proceed with querying the total amount statistics by category
    const { startDate, endDate } = searchParams;

    const expenses = await PaidExpense.aggregate([
        // Match expenses by household, date range, and approval status
        {
            $match: {
                household: new mongoose.Types.ObjectId(householdId), // Filter by householdId
                date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                expenseStatus: "Одобрен",
            },
        },
        // Group by category and sum the amounts
        {
            $group: {
                _id: "$category", // Group by category
                totalAmount: { $sum: "$amount" },
            },
        },
        // Lookup the category details
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'category',
            },
        },
        {
            $unwind: "$category",
        },
        {
            $project: {
                category: "$category.title",
                totalAmount: 1,
            },
        },
        // Sort the results by category title
        {
            $sort: { category: 1 },
        },
    ]);

    return expenses.map((e) => ({ category: e.category, totalAmount: e.totalAmount }));
};

exports.getOne = (paidExpenseId) =>
    PaidExpense.findById(paidExpenseId)
        .select("_id title category creator amount date expenseStatus balance")
        .lean();

exports.getOneDetails = async (paidExpenseId, userId) => {
    const paidExpense = await PaidExpense.findById(paidExpenseId)
        .populate("creator", "_id name avatar avatarColor")
        .populate("balance.user", "_id name avatar avatarColor")
        .populate("comments.user", "_id name avatar avatarColor")
        .lean();

    // Filter userApprovals to only include the current user's status
    const currentUserApproval = paidExpense.userApprovals.find((entry) =>
        entry.user.equals(userId)
    );

    if (currentUserApproval) {
        // Modify paidExpense object to only include currentUserApproval
        paidExpense.userApprovals = [currentUserApproval];
    } else {
        // If current user has no approval entry
        paidExpense.userApprovals = [];
    }

    return paidExpense;
};

exports.getEditableFields = async (paidExpenseId) => {
    const paidExpense = await PaidExpense.aggregate([
        { $match: { _id: new ObjectId(paidExpenseId) } },
        {
            $lookup: {
                from: "users",
                let: { paidUserIds: "$paid.user" },
                pipeline: [
                    { $match: { $expr: { $in: ["$_id", "$$paidUserIds"] } } },
                    { $project: { _id: 1, name: 1, avatar: 1, avatarColor: 1 } }
                ],
                as: "paidUserDetails",
            },
        },
        {
            $lookup: {
                from: "users",
                let: { owedUserIds: "$owed.user" },
                pipeline: [
                    { $match: { $expr: { $in: ["$_id", "$$owedUserIds"] } } },
                    { $project: { _id: 1, name: 1, avatar: 1, avatarColor: 1 } }
                ],
                as: "owedUserDetails",
            },
        },
        {
            $addFields: {
                paid: {
                    $map: {
                        input: "$paid",
                        as: "p",
                        in: {
                            sum: "$$p.sum",
                            _id: "$$p.user",
                            name: {
                                $arrayElemAt: [
                                    "$paidUserDetails.name",
                                    { $indexOfArray: ["$paidUserDetails._id", "$$p.user"] }
                                ]
                            },
                            avatar: {
                                $arrayElemAt: [
                                    "$paidUserDetails.avatar",
                                    { $indexOfArray: ["$paidUserDetails._id", "$$p.user"] }
                                ]
                            },
                            avatarColor: {
                                $arrayElemAt: [
                                    "$paidUserDetails.avatarColor",
                                    { $indexOfArray: ["$paidUserDetails._id", "$$p.user"] }
                                ]
                            }
                        }
                    }
                },
                owed: {
                    $map: {
                        input: "$owed",
                        as: "o",
                        in: {
                            sum: "$$o.sum",
                            _id: "$$o.user",
                            name: {
                                $arrayElemAt: [
                                    "$owedUserDetails.name",
                                    { $indexOfArray: ["$owedUserDetails._id", "$$o.user"] }
                                ]
                            },
                            avatar: {
                                $arrayElemAt: [
                                    "$owedUserDetails.avatar",
                                    { $indexOfArray: ["$owedUserDetails._id", "$$o.user"] }
                                ]
                            },
                            avatarColor: {
                                $arrayElemAt: [
                                    "$owedUserDetails.avatarColor",
                                    { $indexOfArray: ["$owedUserDetails._id", "$$o.user"] }
                                ]
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                amount: 1,
                category: 1,
                date: 1,
                paidSplitType: 1,
                owedSplitType: 1,
                "paid.sum": 1,
                "paid._id": 1,
                "paid.name": 1,
                "paid.avatar": 1,
                "paid.avatarColor": 1,
                "owed.sum": 1,
                "owed._id": 1,
                "owed.name": 1,
                "owed.avatar": 1,
                "owed.avatarColor": 1,
            }
        }
    ]);

    return paidExpense[0];
};

exports.create = async (paidExpenseData) => {
    const {
        title,
        category,
        creator,
        amount,
        date,
        paidSplitType,
        paid,
        owedSplitType,
        owed,
        household,
    } = paidExpenseData;

    // Fetch the household by ID
    const expenseHousehold = await Household.findById(household);

    // Check if there is only one member in the household
    if (expenseHousehold.members.length === 1) {
        throw new AppError(
            "Не може да създадете разход. Домакинството трябва да има повече от един член.",
            403
        );
    }

    // Extract member IDs from the household
    const householdMemberIds = expenseHousehold.members.map((member) =>
        member.user.toString()
    );

    // Collect all unique user IDs from paid and owed arrays
    const uniqueUserIds = new Set([
        ...paid.map((p) => p.user),
        ...owed.map((o) => o.user),
    ]);

    // TODO: Test
    // Check if all users are members of the household
    for (const userId of uniqueUserIds) {
        if (!householdMemberIds.includes(userId)) {
            throw new AppError(
                `Потрибетиел с ID ${userId} не е член на домакинството`,
                403
            );
        }
    }

    const userApprovals = Array.from(uniqueUserIds).map((userId) => ({
        user: userId,
        status: userId === creator.toString() ? "Одобрен" : "За одобрение",
    }));

    // Calculate the total paid and owed sums in cents
    const totalPaid = paid.reduce(
        (sum, entry) => sum + Math.round(entry.sum * 100),
        0
    );
    const totalOwed = owed.reduce(
        (sum, entry) => sum + Math.round(entry.sum * 100),
        0
    );
    const amountInCents = Math.round(amount * 100);

    if (totalPaid !== totalOwed) {
        throw new AppError("Платените и дължимите суми не съвпадат", 400);
    }

    // Check if the total amount matches the sum of paid and owed amounts
    if (totalPaid !== amountInCents) {
        throw new AppError(
            "Общата сума на платените и дължимите суми не съвпада с указаната сума",
            400
        );
    }

    // Calculate the balance array
    const balance = Array.from(uniqueUserIds).map((userId) => {
        const paidEntry = paid.find((p) => p.user === userId);
        const owedEntry = owed.find((o) => o.user === userId);

        const paidSumInCents = paidEntry ? Math.round(paidEntry.sum * 100) : 0;
        const owedSumInCents = owedEntry ? Math.round(owedEntry.sum * 100) : 0;
        const balanceSumInCents = Math.abs(paidSumInCents - owedSumInCents);
        const balanceType = paidSumInCents >= owedSumInCents ? "+" : "-";

        return {
            user: userId,
            sum: Number((balanceSumInCents / 100).toFixed(2)),
            type: balanceType,
        };
    });

    // Create the new expense
    const newPaidExpense = new PaidExpense({
        title,
        category,
        creator,
        amount,
        date,
        paidSplitType,
        paid,
        owedSplitType,
        owed,
        household,
        userApprovals,
        balance,
    });

    // Save the household to the database
    await newPaidExpense.save();

    return newPaidExpense;
};

const updateBalance = async (houesholdId, expenseId) => {
    const expenseHousehold = await Household.findById(houesholdId);
    const expense = await PaidExpense.findById(expenseId);

    // TODO: do this only when all users have approved
    // Update the household balance based on the new balance of the expense
    expense.balance.forEach((newEntry) => {
        const existingEntry = expenseHousehold.balance.find((entry) =>
            entry.user.equals(newEntry.user)
        );

        // Determine the current sum considering the current type
        let currentSumInCents =
            existingEntry.type === "+"
                ? Math.round(existingEntry.sum * 100)
                : -Math.round(existingEntry.sum * 100);

        // Update the sum based on the type of operation
        if (newEntry.type === "+") {
            currentSumInCents += Math.round(newEntry.sum * 100);
        } else {
            currentSumInCents -= Math.round(newEntry.sum * 100);
        }

        // Update the type based on the sum and ensure the sum is always positive
        if (currentSumInCents >= 0) {
            existingEntry.sum = Number((currentSumInCents / 100).toFixed(2));
            existingEntry.type = "+";
        } else {
            existingEntry.sum = Number(
                (Math.abs(currentSumInCents) / 100).toFixed(2)
            );
            existingEntry.type = "-";
        }
    });

    await expenseHousehold.save();
};

exports.accept = async (userId, paidExpenseId) => {
    const paidExpense = await PaidExpense.findById(paidExpenseId);

    // Check if the overall expense status is "За одобрение"
    if (paidExpense.expenseStatus !== "За одобрение") {
        throw new AppError(
            `Статусът на разхода трябва да бъде "За одобрение" за да може да се одобри`,
            400
        );
    }

    const userApproval = paidExpense.userApprovals.find((entry) =>
        entry.user.equals(userId)
    );

    if (!userApproval) {
        throw new AppError(`Потребителят не е намерен`, 400);
    }

    // Check if the current user approval status is "За одобрение"
    if (userApproval.status !== "За одобрение") {
        throw new AppError(
            `Потребителят не може да потвърди/отхвърли разхода повече от веднъж`,
            400
        );
    }

    // Update status to "Одобрен"
    userApproval.status = "Одобрен";

    // Check if all user approvals are now "Одобрен"
    const allApproved = paidExpense.userApprovals.every(
        (entry) => entry.status === "Одобрен"
    );

    if (allApproved) {
        paidExpense.expenseStatus = "Одобрен";

        await updateBalance(paidExpense.household, paidExpenseId);
    }

    // Save the updated paid expense to the database
    await paidExpense.save();
};

exports.reject = async (userId, paidExpenseId, text) => {
    const paidExpense = await PaidExpense.findById(paidExpenseId);

    // Check if the overall expense status is "За одобрение"
    if (paidExpense.expenseStatus !== "За одобрение") {
        throw new AppError(
            `Статусът на разхода трябва да бъде "За одобрение" за да може да се отхвърли`,
            400
        );
    }

    const userApproval = paidExpense.userApprovals.find((entry) =>
        entry.user.equals(userId)
    );

    if (!userApproval) {
        throw new AppError(`Потребителят не е намерен`, 400);
    }

    // Check if the current user approval status is "За одобрение"
    if (userApproval.status !== "За одобрение") {
        throw new AppError(
            `Потребителят не може да потвърди/отхвърли разхода повече от веднъж`,
            400
        );
    }

    // Update status to "Отхвърлен"
    userApproval.status = "Отхвърлен";
    paidExpense.expenseStatus = "Отхвърлен";

    // Add the rejection reason as a comment
    paidExpense.comments.push({
        user: userId,
        text: `Причина за отхвърляне: ${text}`,
        createdAt: new Date(),
    });

    // Save the updated paid expense to the database
    await paidExpense.save();
};

exports.addComment = async (userId, paidExpenseId, text) => {
    // Create a comment object
    const comment = {
        user: userId,
        text: text,
        createdAt: new Date(),
    };

    // Update the PaidExpense document by adding the comment and then fetching
    // the updated document with populated user fields in comments
    const updatedPaidExpense = await PaidExpense.findByIdAndUpdate(
        paidExpenseId,
        { $push: { comments: comment } },
        { new: true } // Return the updated document
    ).populate({
        path: "comments.user",
        select: "name avatar avatarColor",
    });

    // Return the populated comments array
    return updatedPaidExpense.comments;
};

exports.delete = async (userId, paidExpenseId) => {
    // Fetch the existing paid expense
    const existingPaidExpense = await PaidExpense.findById(paidExpenseId);

    // Check if the user making the request is the creator or in the admins array
    const creatorId = existingPaidExpense.creator.toString();
    const householdId = existingPaidExpense.household.toString();

    if (userId.toString() !== creatorId) {
        const household = await Household.findById(householdId);

        const isAdmin = household.admins.some(
            (admin) => admin.toString() === userId.toString()
        );

        if (!isAdmin) {
            throw new AppError(
                "Само създателят или администраторите на домакинството могат да изтриват платените разходи",
                403
            );
        }
    }

    // Check if the paid expense status is "Отхвърлен"
    if (existingPaidExpense.expenseStatus !== "Отхвърлен") {
        throw new AppError(
            "Само платени разходи със статус 'Отхвърлен' могат да бъдат изтривани",
            400
        );
    }

    // Delete the existing paid expense from the database
    await PaidExpense.findByIdAndDelete(paidExpenseId);
};

// exports.update = (paidExpenseId, paidExpenseData) =>
//     PaidExpense.findByIdAndUpdate(paidExpenseId, paidExpenseData);

// exports.delete = (paidExpenseId) =>
//     PaidExpense.findByIdAndDelete(paidExpenseId);

// exports.getAllComments = async (paidExpenseId) => {
//     const paidExpense = await PaidExpense.findById(paidExpenseId)
//         .populate({
//             path: "comments.user",
//             select: "name avatar avatarColor",
//         })
//         .lean();

//     return paidExpense.comments;
// };
