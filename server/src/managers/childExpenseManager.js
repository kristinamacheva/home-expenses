const Household = require("../models/Household");
const User = require("../models/User");
const ChildExpense = require("../models/ChildExpense");
const { AppError } = require("../utils/AppError");
const { default: mongoose } = require("mongoose");
const { ObjectId } = require("mongoose").Types;

exports.getAll = async (userId, householdId, page, limit, searchParams) => {
    const skip = (page - 1) * limit;

    // Build dynamic match conditions based on search parameters
    let matchConditions = {
        household: new ObjectId(householdId),
        child: new ObjectId(userId),
    };

    if (searchParams.title) {
        matchConditions.title = {
            $regex: new RegExp(searchParams.title, "i"),
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

    // Aggregation pipeline to fetch child expenses
    const pipeline = [
        // Stage 1: Match documents with dynamic conditions
        { $match: matchConditions },

        // Stage 2: Sort by date and _id in descending order
        { $sort: { date: -1, _id: -1 } },

        // Stage 3: Pagination: Skip records
        { $skip: skip },

        // Stage 4: Pagination: Limit records
        { $limit: limit },

        // Stage 5: Project the final shape of the documents
        {
            $project: {
                _id: 1,
                title: 1,
                amount: 1,
                date: 1,
            },
        },
    ];

    // Execute aggregation pipeline
    const childExpenses = await ChildExpense.aggregate(pipeline);

    // Count total number of documents matching the conditions
    const totalCount = await ChildExpense.countDocuments(matchConditions);

    return { childExpenses, totalCount };
};

exports.create = async (childExpenseData) => {
    const { title, amount, date, household, child } = childExpenseData;

    // Start a session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Fetch the household and the child within the session
        const expenseHousehold = await Household.findById(household).session(
            session
        );

        const expenseChild = await User.findById(child).session(session);

        // Check if the household is archived
        if (expenseHousehold.archived) {
            throw new AppError("Домакинството е архивирано", 403);
        }

        // Check if the child is a member of the household
        if (!expenseChild.households.includes(household)) {
            throw new AppError("Детето не е член на това домакинство.", 403);
        }

        // Get the child's allowance in the household
        const childAllowance = expenseHousehold.allowances.find(
            (allowance) => allowance.user.toString() === child
        );

        if (!childAllowance) {
            throw new AppError(
                "Потребителят няма джобни в това домакинство.",
                400
            );
        }

        // Convert amounts to cents to avoid floating point issues
        const amountInCents = Math.round(amount * 100);
        const allowanceInCents = Math.round(childAllowance.sum * 100);

        // Check if the allowance is sufficient
        if (allowanceInCents < amountInCents) {
            throw new AppError("Недостатъчно джобни за тази транзакция.", 400);
        }

        // Update the allowance sum
        childAllowance.sum = Number(
            ((allowanceInCents - amountInCents) / 100).toFixed(2)
        );

        // Create the new expense object
        const newChildExpenseData = {
            title,
            amount,
            date,
            household,
            child,
        };

        // Create and save the new expense
        const newChildExpense = new ChildExpense(newChildExpenseData);
        await newChildExpense.save({ session });

        // Save the updated household with the new allowance sum
        await expenseHousehold.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return newChildExpense;
    } catch (error) {
        // Abort the transaction in case of error
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
