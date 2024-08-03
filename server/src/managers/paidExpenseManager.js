const Household = require("../models/Household");
const User = require("../models/User");
const PaidExpense = require("../models/PaidExpense");
const Payment = require("../models/Payment");
const Category = require("../models/Category");
const { AppError } = require("../utils/AppError");
const { default: mongoose } = require("mongoose");
const { sendNotificationToUser } = require("../config/socket");
const Notification = require("../models/Notification");
const Allowance = require("../models/Allowance");

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
        matchConditions.category = new ObjectId(searchParams.category); // Exact match by ID
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
        // Stage 1: Match documents with dynamic conditions
        { $match: matchConditions },

        // Stage 2: Lookup to join with the categories collection
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "categoryDetails",
            },
        },

        // Stage 3: Unwind the categoryDetails array to de-normalize the results
        { $unwind: "$categoryDetails" },

        // Stage 4: Optionally add fields or replace values
        {
            $addFields: {
                category: "$categoryDetails.title", // Replace category _id with title
            },
        },

        // Stage 5: Sort by date and _id in descending order
        { $sort: { date: -1, _id: -1 } },

        // Stage 6: Pagination: Skip records
        { $skip: skip },

        // Stage 7: Pagination: Limit records
        { $limit: limit },

        // Stage 8: Filter balance array based on userId
        {
            $addFields: {
                balance: {
                    $filter: {
                        input: "$balance",
                        as: "entry",
                        cond: {
                            $eq: ["$$entry.user", new ObjectId(userId)],
                        },
                    },
                },
            },
        },

        // Stage 9: Project the final shape of the documents
        {
            $project: {
                _id: 1,
                title: 1,
                category: 1,
                creator: 1,
                amount: 1,
                date: 1,
                expenseStatus: 1,
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

exports.getTotalAmountByCategoryStats = async (
    householdId,
    userId,
    searchParams
) => {
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
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "category",
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

    return expenses.map((e) => ({
        category: e.category,
        totalAmount: e.totalAmount,
    }));
};

exports.getTotalAmountAndCountStats = async (
    householdId,
    userId,
    searchParams
) => {
    // Check if the user belongs to the household
    const user = await User.findOne({ _id: userId, households: householdId });
    if (!user) {
        throw new AppError(`Потребителят не е част от домакинството`, 401);
    }

    const { startDate, endDate } = searchParams;

    const stats = await PaidExpense.aggregate([
        {
            $match: {
                household: new mongoose.Types.ObjectId(householdId),
                date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                expenseStatus: "Одобрен",
            },
        },
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "categoryDetails",
            },
        },
        {
            $unwind: "$categoryDetails",
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
                count: { $sum: 1 },
                uncategorizedAmount: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    "$categoryDetails.title",
                                    "Некатегоризиран",
                                ],
                            },
                            "$amount",
                            0,
                        ],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalAmount: 1,
                count: 1,
                uncategorizedPercentage: {
                    $cond: [
                        { $eq: ["$totalAmount", 0] },
                        0,
                        {
                            $multiply: [
                                {
                                    $divide: [
                                        "$uncategorizedAmount",
                                        "$totalAmount",
                                    ],
                                },
                                100,
                            ],
                        },
                    ],
                },
            },
        },
    ]);

    if (stats.length > 0) {
        return {
            totalAmount: parseFloat(stats[0].totalAmount.toFixed(2)),
            count: stats[0].count,
            uncategorizedPercentage: parseFloat(
                stats[0].uncategorizedPercentage.toFixed(2)
            ),
        };
    } else {
        return {
            totalAmount: 0,
            count: 0,
            uncategorizedPercentage: 0,
        };
    }
};

exports.getOne = (paidExpenseId) =>
    PaidExpense.findById(paidExpenseId)
        .select("_id title category creator amount date expenseStatus balance")
        .lean();

exports.getOneDetails = async (paidExpenseId, userId) => {
    const paidExpense = await PaidExpense.findById(paidExpenseId)
        .populate("creator", "_id name avatar avatarColor")
        .populate("category", "_id title")
        .populate("balance.user", "_id name avatar avatarColor")
        .populate("comments.user", "_id name avatar avatarColor")
        .lean();

    // Find the household and check the user's role
    const household = await Household.findById(paidExpense.household).lean();

    const userRole = household.members.find(
        (member) => member.user.toString() === userId
    )?.role;

    if (!userRole) {
        throw new AppError("Потребителят не е част от домакинството", 400);
    }

    if (userRole === "Дете") {
        throw new AppError(
            "Потребителят е с роля 'Дете' и не може да достъпва информация за разходите",
            400
        );
    }

    // Check if the child field is present and populate it if necessary
    if (paidExpense.child) {
        const childDetails = await User.findById(
            paidExpense.child,
            "_id name avatar avatarColor"
        ).lean();
        paidExpense.child = childDetails;
    }

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
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            avatar: 1,
                            avatarColor: 1,
                        },
                    },
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
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            avatar: 1,
                            avatarColor: 1,
                        },
                    },
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
                                    {
                                        $indexOfArray: [
                                            "$paidUserDetails._id",
                                            "$$p.user",
                                        ],
                                    },
                                ],
                            },
                            avatar: {
                                $arrayElemAt: [
                                    "$paidUserDetails.avatar",
                                    {
                                        $indexOfArray: [
                                            "$paidUserDetails._id",
                                            "$$p.user",
                                        ],
                                    },
                                ],
                            },
                            avatarColor: {
                                $arrayElemAt: [
                                    "$paidUserDetails.avatarColor",
                                    {
                                        $indexOfArray: [
                                            "$paidUserDetails._id",
                                            "$$p.user",
                                        ],
                                    },
                                ],
                            },
                        },
                    },
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
                                    {
                                        $indexOfArray: [
                                            "$owedUserDetails._id",
                                            "$$o.user",
                                        ],
                                    },
                                ],
                            },
                            avatar: {
                                $arrayElemAt: [
                                    "$owedUserDetails.avatar",
                                    {
                                        $indexOfArray: [
                                            "$owedUserDetails._id",
                                            "$$o.user",
                                        ],
                                    },
                                ],
                            },
                            avatarColor: {
                                $arrayElemAt: [
                                    "$owedUserDetails.avatarColor",
                                    {
                                        $indexOfArray: [
                                            "$owedUserDetails._id",
                                            "$$o.user",
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
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
                // Conditionally include the child field
                child: {
                    $cond: {
                        if: { $gt: ["$child", null] },
                        then: "$child",
                        else: "$$REMOVE",
                    },
                },
            },
        },
    ]);

    return paidExpense[0];
};

exports.create = async (paidExpenseData) => {
    const {
        title,
        category: inputCategory,
        creator,
        amount,
        date,
        paidSplitType,
        paid,
        owedSplitType,
        owed,
        household,
        child,
    } = paidExpenseData;

    // Check for pending payments for the creator
    const pendingPayments = await Payment.find({
        household: household,
        payee: creator,
        paymentStatus: "За одобрение",
    });

    if (pendingPayments.length > 0) {
        throw new AppError(
            "Не може да създадете нов разход преди да одобрите всички плащания.",
            403
        );
    }

    // Fetch the household by ID
    const expenseHousehold = await Household.findById(household);

    // Check if the household is archived
    if (expenseHousehold.archived) {
        throw new AppError(`Домакинството е архивирано`, 403);
    }

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

    let category = inputCategory;

    if (!category) {
        // Find uncategorized category if no category is provided
        const uncategorizedCategory = await Category.findOne({
            title: "Некатегоризиран",
        });
        if (uncategorizedCategory) {
            category = uncategorizedCategory._id;
        } else {
            throw new AppError(
                "Категорията 'Некатегоризиран' не е намерена",
                404
            );
        }
    } else {
        // Check if the provided category ID exists
        const existingCategory = await Category.findById(category);
        if (!existingCategory) {
            throw new AppError("Посочената категория не съществува", 404);
        }

        // Check if the category title is "Джобни"
        if (existingCategory.title === "Джобни") {
            // Validate the child ID if it's provided
            if (!child) {
                throw new AppError(
                    "Не е посочено дете за категория 'Джобни'",
                    400
                );
            }

            // Check if the child ID exists and has the role "Дете"
            const childMember = expenseHousehold.members.find(
                (member) =>
                    member.user.toString() === child && member.role === "Дете"
            );

            if (!childMember) {
                throw new AppError(
                    "Посоченото дете не е член на домакинството или няма ролята 'Дете'",
                    404
                );
            }
        }
    }

    // Create the new expense object
    const newPaidExpenseData = {
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
    };

    // Add child only if it is valid and the category is "Джобни"
    if (child) {
        newPaidExpenseData.child = child;
    }

    // Create and save the new expense
    const newPaidExpense = new PaidExpense(newPaidExpenseData);
    await newPaidExpense.save();

    // Create and send notifications for all users part of the expense
    const message = `Създаден е нов разход в домакинство: ${expenseHousehold.name}`;

    Array.from(uniqueUserIds).map(async (userId) => {
        if (userId !== creator.toString()) {
            const notification = new Notification({
                user: userId,
                message: message,
                resourceType: "PaidExpense",
                resourceId: newPaidExpense._id,
                household: expenseHousehold._id,
            });

            const savedNotification = await notification.save();

            // Send notification to the user if they have an active connection
            sendNotificationToUser(userId, savedNotification);
        }
    });

    return newPaidExpense;
};

exports.update = async (userId, paidExpenseId, paidExpenseData) => {
    const {
        title,
        category: inputCategory,
        amount,
        date,
        paidSplitType,
        paid,
        owedSplitType,
        owed,
        household,
        child,
    } = paidExpenseData;

    // Fetch the existing expense to check for existence and permissions
    const existingExpense = await PaidExpense.findById(paidExpenseId);

    // Fetch the household to check membership and roles
    const expenseHousehold = await Household.findById(household);

    // Check if the household is archived
    if (expenseHousehold.archived) {
        throw new AppError(`Домакинството е архивирано`, 403);
    }

    // Check if the user is an admin
    const isAdmin = expenseHousehold.admins.some(
        (admin) => admin.toString() === userId.toString()
    );

    // Check if the user is the creator or an admin of the household
    if (existingExpense.creator.toString() !== userId && !isAdmin) {
        throw new AppError("Нямате право да редактирате този разход", 403);
    }

    // Check if the paid expense status is "Отхвърлен"
    if (existingExpense.expenseStatus !== "Отхвърлен") {
        throw new AppError(
            "Само платени разходи със статус 'Отхвърлен' могат да бъдат редактирани",
            400
        );
    }

    // Check if paid or owed arrays have changed
    const paidChanged =
        JSON.stringify(existingExpense.paid) !== JSON.stringify(paid);
    const owedChanged =
        JSON.stringify(existingExpense.owed) !== JSON.stringify(owed);

    let userApprovals;

    // Perform validations if paid or owed have changed
    if (paidChanged || owedChanged) {
        // Extract member IDs from the household
        const householdMemberIds = expenseHousehold.members.map((member) =>
            member.user.toString()
        );

        // Collect all unique user IDs from paid and owed arrays
        const uniqueUserIds = new Set([
            ...paid.map((p) => p.user),
            ...owed.map((o) => o.user),
        ]);

        // Check if all users are members of the household
        for (const userId of uniqueUserIds) {
            if (!householdMemberIds.includes(userId)) {
                throw new AppError(
                    `Потребител с ID ${userId} не е член на домакинството`,
                    403
                );
            }
        }

        userApprovals = Array.from(uniqueUserIds).map((currentUserId) => ({
            user: currentUserId,
            status: currentUserId === userId ? "Одобрен" : "За одобрение",
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

        // Check if the total paid and owed amounts match
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

            const paidSumInCents = paidEntry
                ? Math.round(paidEntry.sum * 100)
                : 0;
            const owedSumInCents = owedEntry
                ? Math.round(owedEntry.sum * 100)
                : 0;
            const balanceSumInCents = Math.abs(paidSumInCents - owedSumInCents);
            const balanceType = paidSumInCents >= owedSumInCents ? "+" : "-";

            return {
                user: userId,
                sum: Number((balanceSumInCents / 100).toFixed(2)),
                type: balanceType,
            };
        });

        existingExpense.balance = balance;
    } else {
        // If neither paid nor owed has changed, use the existing userApprovals
        // and mark the status for the creator as "Одобрен"
        userApprovals = existingExpense.userApprovals.map((approval) => ({
            user: approval.user,
            status:
                approval.user.toString() === userId
                    ? "Одобрен"
                    : "За одобрение",
        }));
    }
    // Check if the category has changed and validate if needed
    let category = existingExpense.category.toString(); // Keep existing category by default
    if (inputCategory && inputCategory !== category) {
        // Check if the provided category ID exists
        const existingCategory = await Category.findById(inputCategory);
        if (!existingCategory) {
            throw new AppError("Посочената категория не съществува", 404);
        }

        category = inputCategory;

        // Check if the category title is "Джобни" and if the child field is valid
        if (existingCategory.title === "Джобни") {
            if (!child) {
                throw new AppError(
                    "Не е посочено дете за категория 'Джобни'",
                    400
                );
            }

            // Check if the child ID exists and has the role "Дете"
            const childMember = expenseHousehold.members.find(
                (member) =>
                    member.user.toString() === child && member.role === "Дете"
            );

            if (!childMember) {
                throw new AppError(
                    "Посоченото дете не е член на домакинството или няма ролята 'Дете'",
                    404
                );
            }
        }
    }

    // Update the expense with new data
    existingExpense.title = title;
    existingExpense.category = category;
    existingExpense.amount = amount;
    existingExpense.date = date;
    existingExpense.paidSplitType = paidSplitType;
    existingExpense.paid = paidChanged ? paid : existingExpense.paid;
    existingExpense.owedSplitType = owedSplitType;
    existingExpense.owed = owedChanged ? owed : existingExpense.owed;
    existingExpense.household = household;
    if (child) {
        existingExpense.child = child;
    } else {
        existingExpense.child = undefined; // Remove child if not provided
    }

    existingExpense.expenseStatus = "За одобрение";
    existingExpense.userApprovals = userApprovals;

    await existingExpense.save();

    expenseHousehold.members.map(async (member) => {
        if (member.user.toString() !== userId && member.role !== "Дете") {
            // Create and send notifications for all members
            const message = `Редактиран е разход в домакинство: ${expenseHousehold.name}`;

            const notification = new Notification({
                user: member.user,
                message: message,
                household: expenseHousehold._id,
                resourceType: "PaidExpense",
                resourceId: existingExpense._id,
            });

            const savedNotification = await notification.save();

            // Send notification to the user if they have an active connection
            sendNotificationToUser(member.user, savedNotification);
        }
    });
};

const updateBalance = async (householdId, expenseId, childId, categoryId) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const expenseHousehold = await Household.findById(householdId).session(
            session
        );
        const expense = await PaidExpense.findById(expenseId).session(session);
        const existingCategory = await Category.findById(categoryId).session(
            session
        );

        // Update the household balance based on the new balance of the expense
        for (const newEntry of expense.balance) {
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
                existingEntry.sum = Number(
                    (currentSumInCents / 100).toFixed(2)
                );
                existingEntry.type = "+";
            } else {
                existingEntry.sum = Number(
                    (Math.abs(currentSumInCents) / 100).toFixed(2)
                );
                existingEntry.type = "-";
            }

            // Create and send notifications for all members
            const message = `Има промени по баланса в домакинство: ${expenseHousehold.name}`;

            const notification = new Notification({
                user: newEntry.user,
                message: message,
                household: expenseHousehold._id,
            });

            const savedNotification = await notification.save({ session });

            // Send notification to the user if they have an active connection
            sendNotificationToUser(newEntry.user, savedNotification);
        }

        // If the category title is "Джобни", update the child's allowance
        if (existingCategory.title === "Джобни") {
            // Verify if the child still has the role "Дете" in the household
            const childMember = expenseHousehold.members.find(
                (member) =>
                    member.user.equals(childId) && member.role === "Дете"
            );

            if (!childMember) {
                throw new AppError(
                    "Посоченото дете вече не е член на домакинството или няма ролята 'Дете'",
                    404
                );
            }

            // Add the expense sum to the child's allowances in the household
            const expenseAmountInCents = Math.round(expense.amount * 100);

            const childAllowance = expenseHousehold.allowances.find(
                (allowance) => allowance.user.equals(childId)
            );

            childAllowance.sum = Number(
                (
                    (Math.round(childAllowance.sum * 100) +
                        expenseAmountInCents) /
                    100
                ).toFixed(2)
            );

            // Create a new Allowance document for the child
            const newAllowance = new Allowance({
                child: childId,
                household: householdId,
                amount: expense.amount,
            });

            await newAllowance.save({ session });

            // Create and send notifications for child
            const message = `Налична е нова сума за джобни в домакинство: ${expenseHousehold.name}`;

            const notification = new Notification({
                user: childId,
                message: message,
                resourceType: "Allowance",
                resourceId: newAllowance._id,
                household: expenseHousehold._id,
            });

            const savedNotification = await notification.save({ session });

            // Send notification to the user if they have an active connection
            sendNotificationToUser(childId, savedNotification);
        }

        await expenseHousehold.save({ session });

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
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

        await updateBalance(
            paidExpense.household,
            paidExpenseId,
            paidExpense.child,
            paidExpense.category
        );
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

        // Check if the household is archived
        if (household.archived) {
            throw new AppError(`Домакинството е архивирано`, 403);
        }

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
