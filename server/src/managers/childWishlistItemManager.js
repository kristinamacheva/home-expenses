const Household = require("../models/Household");
const ChildWishlistItem = require("../models/ChildWishlistItem");
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

    // Item purchased conditions
    let childWishlistItemPurchaseConditions = [];

    // If purchased is explicitly false
    if (searchParams.purchased === false)
        childWishlistItemPurchaseConditions.push(true);

    // If notPurchased is explicitly false
    if (searchParams.notPurchased === false)
        childWishlistItemPurchaseConditions.push(false);

    // If there are any conditions to filter out, add them to the match
    if (childWishlistItemPurchaseConditions.length > 0) {
        matchConditions.purchased = {
            $nin: childWishlistItemPurchaseConditions,
        };
    }

    // Aggregation pipeline to fetch items and filter balance array
    const pipeline = [
        // Stage 1: Match documents with dynamic conditions
        { $match: matchConditions },

        // Stage 2: Sort by createdAt and _id in descending order
        { $sort: { createdAt: -1, _id: -1 } },

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
                createdAt: 1,
                purchased: 1,
                purchaseDate: 1,
            },
        },
    ];

    // Execute aggregation pipeline
    const childWishlistItems = await ChildWishlistItem.aggregate(pipeline);

    // Count total number of documents matching the conditions
    const totalCount = await ChildWishlistItem.countDocuments(matchConditions);

    return { childWishlistItems, totalCount };
};

exports.getOne = (childWishlistItemId) =>
    ChildWishlistItem.findById(childWishlistItemId)
        .select("_id title amount createdAt purchased purchaseDate")
        .lean();

exports.getEditableFields = (childWishlistItemId) =>
    ChildWishlistItem.findById(childWishlistItemId)
        .select("_id title amount")
        .lean();

exports.create = async (childWishlistItemData) => {
    const { title, amount, child, household } = childWishlistItemData;

    // Fetch the household by ID
    const childWishlistItemHousehold = await Household.findById(household);

    // Check if the household is archived
    if (childWishlistItemHousehold.archived) {
        throw new AppError(`Домакинството е архивирано`, 403);
    }

    // Get the child's allowance in the household
    const childAllowance = childWishlistItemHousehold.allowances.find(
        (allowance) => allowance.user.toString() === child
    );

    if (!childAllowance) {
        throw new AppError("Потребителят няма джобни в това домакинство.", 400);
    }

    // Create the new item
    const newChildWishlistItemData = {
        title,
        amount,
        child,
        household,
    };

    // Create and save the new item
    const newChildWishlistItem = new ChildWishlistItem(
        newChildWishlistItemData
    );
    await newChildWishlistItem.save();

    return newChildWishlistItem;
};

exports.update = async (userId, childWishlistItemId, childWishlistItemData) => {
    const { title, amount, child, household } = childWishlistItemData;

    // Fetch the existing item to check for existence and permissions
    const existingChildWishlistItem = await ChildWishlistItem.findById(
        childWishlistItemId
    );

    if (existingChildWishlistItem.purchased) {
        throw new AppError(`Желанието вече е закупено`, 400);
    }

    // Fetch the household by ID
    const childWishlistItemHousehold = await Household.findById(household);

    // Check if the household is archived
    if (childWishlistItemHousehold.archived) {
        throw new AppError(`Домакинството е архивирано`, 403);
    }

    if (userId.toString() !== child.toString()) {
        throw new AppError(
            `Това желание не е създадено от този потребител.`,
            403
        );
    }

    // Get the child's allowance in the household
    const childAllowance = childWishlistItemHousehold.allowances.find(
        (allowance) => allowance.user.toString() === child
    );

    if (!childAllowance) {
        throw new AppError("Потребителят няма джобни в това домакинство.", 400);
    }

    // Update the item with new data
    existingChildWishlistItem.title = title;
    existingChildWishlistItem.amount = amount;

    await existingChildWishlistItem.save();
};

exports.purchase = async (userId, childWishlistItemId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingChildWishlistItem = await ChildWishlistItem.findById(
            childWishlistItemId
        ).session(session);

        // Fetch the household by ID
        const childWishlistItemHousehold = await Household.findById(
            existingChildWishlistItem.household
        ).session(session);

        // Check if the household is archived
        if (childWishlistItemHousehold.archived) {
            throw new AppError(`Домакинството е архивирано`, 403);
        }

        if (userId.toString() !== existingChildWishlistItem.child.toString()) {
            throw new AppError(
                `Това желание не е създадено от този потребител.`,
                403
            );
        }

        // Get the child's allowance in the household
        const childAllowance = childWishlistItemHousehold.allowances.find(
            (allowance) =>
                allowance.user.toString() ===
                existingChildWishlistItem.child.toString()
        );

        if (!childAllowance) {
            throw new AppError(
                "Потребителят няма джобни в това домакинство.",
                400
            );
        }

        if (existingChildWishlistItem.purchased) {
            throw new AppError(`Желанието вече е закупено`, 400);
        }

        // Convert amounts to cents to avoid floating point issues
        const amountInCents = Math.round(
            existingChildWishlistItem.amount * 100
        );
        const allowanceInCents = Math.round(childAllowance.sum * 100);

        // Check if the allowance is sufficient
        if (allowanceInCents < amountInCents) {
            throw new AppError("Недостатъчно джобни за тази транзакция.", 400);
        }

        // Update the allowance sum
        childAllowance.sum = Number(
            ((allowanceInCents - amountInCents) / 100).toFixed(2)
        );

        // Set the purchase date to the current date with time zeroed out
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        existingChildWishlistItem.purchased = true;
        existingChildWishlistItem.purchaseDate = currentDate;

        // Create a new ChildExpense
        const newChildExpense = new ChildExpense({
            title: existingChildWishlistItem.title,
            amount: existingChildWishlistItem.amount,
            date: currentDate,
            household: existingChildWishlistItem.household,
            child: existingChildWishlistItem.child,
        });

        // Save the updates as part of the transaction
        await childWishlistItemHousehold.save({ session });
        await existingChildWishlistItem.save({ session });
        await newChildExpense.save({ session });

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

exports.delete = async (userId, childWishlistItemId) => {
    // Fetch the existing item
    const existingChildWishlistItem = await ChildWishlistItem.findById(
        childWishlistItemId
    );

    // Check if the user making the request is the creator
    const childId = existingChildWishlistItem.child.toString();
    const householdId = existingChildWishlistItem.household.toString();

    const household = await Household.findById(householdId);

    // Check if the household is archived
    if (household.archived) {
        throw new AppError(`Домакинството е архивирано`, 403);
    }

    if (userId.toString() !== childId) {
        throw new AppError(
            "Само създателят на желанието може да го изтрие.",
            403
        );
    }

    // Delete the existing item from the database
    await ChildWishlistItem.findByIdAndDelete(childWishlistItemId);
};
