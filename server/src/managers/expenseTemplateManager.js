const Household = require("../models/Household");
const Category = require("../models/Category");
const { AppError } = require("../utils/AppError");
const ExpenseTemplate = require("../models/ExpenseTemplate");

const { ObjectId } = require("mongoose").Types;

exports.getAll = async (userId, householdId, page, limit, searchParams) => {
    const skip = (page - 1) * limit;

    // Build dynamic match conditions based on search parameters
    let matchConditions = {
        household: new ObjectId(householdId),
        creator: new ObjectId(userId),
    };

    if (searchParams.templateName) {
        matchConditions.templateName = {
            $regex: new RegExp(searchParams.templateName, "i"),
        }; // Case-insensitive search
    }

    if (searchParams.category) {
        matchConditions.category = new ObjectId(searchParams.category); // Exact match by ID
    }

    // Aggregation pipeline to fetch templates
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
        { $sort: { createdAt: -1, _id: -1 } },

        // Stage 6: Pagination: Skip records
        { $skip: skip },

        // Stage 7: Pagination: Limit records
        { $limit: limit },

        // Stage 8: Project the final shape of the documents
        {
            $project: {
                _id: 1,
                templateName: 1,
                category: 1,
            },
        },
    ];

    // Execute aggregation pipeline
    const expenseTemplates = await ExpenseTemplate.aggregate(pipeline);

    // Count total number of documents matching the conditions
    const totalCount = await ExpenseTemplate.countDocuments(matchConditions);

    return { expenseTemplates, totalCount };
};

exports.getOne = async (expenseTemplateId) => {
    const expenseTemplate = await ExpenseTemplate.aggregate([
        { $match: { _id: new ObjectId(expenseTemplateId) } },

        // Lookup for paid user details
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

        // Lookup for owed user details
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

        // Lookup for category title
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "categoryDetails",
            },
        },

        // Unwind categoryDetails to get the category title
        {
            $unwind: "$categoryDetails",
        },

        // Lookup for child details
        {
            $lookup: {
                from: "users",
                localField: "child",
                foreignField: "_id",
                as: "childDetails",
            },
        },

        // Add fields with formatted user details
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
                category: "$categoryDetails.title", // Include category title
                child: {
                    $cond: {
                        if: { $gt: [{ $size: "$childDetails" }, 0] }, // Check if childDetails is not empty
                        then: {
                            _id: { $arrayElemAt: ["$childDetails._id", 0] },
                            name: { $arrayElemAt: ["$childDetails.name", 0] },
                            avatar: {
                                $arrayElemAt: ["$childDetails.avatar", 0],
                            },
                            avatarColor: {
                                $arrayElemAt: ["$childDetails.avatarColor", 0],
                            },
                        },
                        else: "$$REMOVE",
                    },
                },
            },
        },

        // Project the final fields
        {
            $project: {
                _id: 1,
                templateName: 1,
                title: 1,
                amount: 1,
                category: 1,
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
                child: 1, // Include child details if they exist
            },
        },
    ]);

    return expenseTemplate[0];
};

exports.getEditableFields = async (expenseTemplateId) => {
    const expenseTemplate = await ExpenseTemplate.aggregate([
        { $match: { _id: new ObjectId(expenseTemplateId) } },
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
                templateName: 1,
                title: 1,
                amount: 1,
                category: 1,
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

    return expenseTemplate[0];
};

exports.create = async (expenseTemplateData) => {
    const {
        templateName,
        title,
        category: inputCategory,
        creator,
        amount,
        paidSplitType,
        paid,
        owedSplitType,
        owed,
        household,
        child,
    } = expenseTemplateData;

    // Fetch the household by ID
    const templateHousehold = await Household.findById(household);

    // Check if the household is archived
    if (templateHousehold.archived) {
        throw new AppError(`Домакинството е архивирано`, 403);
    }

    if (!paidSplitType && Array.isArray(paid) && paid.length > 0) {
        throw new AppError(
            "Типът на разпределение на плащанията трябва да бъде посочен, ако има платци",
            400
        );
    }

    if (!owedSplitType && Array.isArray(owed) && owed.length > 0) {
        throw new AppError(
            "Типът на разпределение на плащанията трябва да бъде посочен, ако има длъжници",
            400
        );
    }

    // Extract member IDs from the household
    const householdMemberIds = templateHousehold.members.map((member) =>
        member.user.toString()
    );

    // Helper function to validate if all users in an array are members of the household
    const validateUsersAreHouseholdMembers = (users) => {
        for (const user of users) {
            if (!householdMemberIds.includes(user.user.toString())) {
                throw new AppError(
                    `Потребител с ID ${user.user.toString()} не е член на домакинството`,
                    403
                );
            }
        }
    };

    // Validate 'paid' array if it exists and is not empty
    if (paidSplitType) {
        if (!paid || !Array.isArray(paid) || paid.length === 0) {
            throw new AppError(
                "Плащащи лица трябва да бъдат посочени при избран метод за разпределяне",
                400
            );
        }

        // Validate if all users in the 'paid' array are members of the household
        validateUsersAreHouseholdMembers(paid);
    }

    // Validate 'owed' array if it exists and is not empty
    if (owedSplitType) {
        if (!owed || !Array.isArray(owed) || owed.length === 0) {
            throw new AppError(
                "Дължащи лица трябва да бъдат посочени при избран метод за разпределяне",
                400
            );
        }

        // Validate if all users in the 'owed' array are members of the household
        validateUsersAreHouseholdMembers(owed);
    }

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
        if (existingCategory.title === "Джобни" && child) {
            // Check if the child ID exists and has the role "Дете"
            const childMember = templateHousehold.members.find(
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
    const newExpenseTemplateData = {
        templateName,
        title,
        category,
        creator,
        amount,
        paidSplitType,
        paid,
        owedSplitType,
        owed,
        household,
    };

    // Add child only if it is valid and the category is "Джобни"
    if (child) {
        newExpenseTemplateData.child = child;
    }

    // Create and save the new expense
    const newExpenseTemplate = new ExpenseTemplate(newExpenseTemplateData);
    await newExpenseTemplate.save();

    return newExpenseTemplate;
};

exports.update = async (userId, expenseTemplateId, expenseTemplateData) => {
    const {
        templateName,
        title,
        category: inputCategory,
        amount,
        paidSplitType,
        paid,
        owedSplitType,
        owed,
        household,
        child,
    } = expenseTemplateData;

    // Fetch the existing expense template to check for existence and permissions
    const existingExpenseTemplate = await ExpenseTemplate.findById(
        expenseTemplateId
    );

    // Fetch the household to check membership and roles
    const templateHousehold = await Household.findById(household);

    // Check if the household is archived
    if (templateHousehold.archived) {
        throw new AppError(`Домакинството е архивирано`, 403);
    }

    // Check if the user is the creator
    if (existingExpenseTemplate.creator.toString() !== userId) {
        throw new AppError("Нямате право да редактирате този шаблон", 403);
    }

    if (!paidSplitType && Array.isArray(paid) && paid.length > 0) {
        throw new AppError(
            "Типът на разпределение на плащанията трябва да бъде посочен, ако има платци",
            400
        );
    }

    if (!owedSplitType && Array.isArray(owed) && owed.length > 0) {
        throw new AppError(
            "Типът на разпределение на плащанията трябва да бъде посочен, ако има длъжници",
            400
        );
    }

    // Check if paid or owed arrays have changed
    const paidChanged =
        JSON.stringify(existingExpenseTemplate.paid) !== JSON.stringify(paid);
    const owedChanged =
        JSON.stringify(existingExpenseTemplate.owed) !== JSON.stringify(owed);

    // Extract member IDs from the household
    const householdMemberIds = templateHousehold.members.map((member) =>
        member.user.toString()
    );

    // Function to validate that all users are members of the household
    const validateUsersAreHouseholdMembers = (users) => {
        for (const user of users) {
            if (!householdMemberIds.includes(user.user.toString())) {
                throw new AppError(
                    `Потребител с ID ${user.user.toString()} не е член на домакинството`,
                    403
                );
            }
        }
    };

    // Perform validations if `paid` has changed and it's not an empty array
    if (paidChanged) {
        if (paidSplitType && (!Array.isArray(paid) || paid.length === 0)) {
            throw new AppError(
                "Плащащи лица трябва да бъдат посочени при избран метод за разпределяне",
                400
            );
        }
        validateUsersAreHouseholdMembers(paid);
    }

    // Perform validations if `owed` has changed and it's not an empty array
    if (owedChanged) {
        if (owedSplitType && (!Array.isArray(owed) || owed.length === 0)) {
            throw new AppError(
                "Дължащи лица трябва да бъдат посочени при избран метод за разпределяне",
                400
            );
        }
        validateUsersAreHouseholdMembers(owed);
    }

    // Check if the category has changed and validate if needed
    let category = existingExpenseTemplate.category.toString(); // Keep existing category by default
    if (inputCategory && inputCategory !== category) {
        const existingCategory = await Category.findById(inputCategory);
        if (!existingCategory) {
            throw new AppError("Посочената категория не съществува", 404);
        }

        category = inputCategory;

        // Check if the category title is "Джобни"
        if (existingCategory.title === "Джобни" && child) {
            // Check if the child ID exists and has the role "Дете"
            const childMember = templateHousehold.members.find(
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
    } else if (!inputCategory) {
        // If no category is provided, check if the existing category is not "Uncategorized"
        const uncategorizedCategory = await Category.findOne({
            title: "Некатегоризиран",
        });

        if (uncategorizedCategory) {
            // Only update the category if the existing one is not "Uncategorized"
            if (category !== uncategorizedCategory._id.toString()) {
                category = uncategorizedCategory._id;
            }
        } else {
            throw new AppError(
                "Категорията 'Некатегоризиран' не е намерена",
                404
            );
        }
    }

    // Update the expense template with new data
    existingExpenseTemplate.templateName = templateName;
    existingExpenseTemplate.title = title;
    existingExpenseTemplate.category = category;
    existingExpenseTemplate.amount = amount;
    existingExpenseTemplate.paidSplitType = paidSplitType;
    existingExpenseTemplate.paid = paidChanged
        ? paid
        : existingExpenseTemplate.paid;
    existingExpenseTemplate.owedSplitType = owedSplitType;
    existingExpenseTemplate.owed = owedChanged
        ? owed
        : existingExpenseTemplate.owed;
    existingExpenseTemplate.household = household;
    if (child) {
        existingExpenseTemplate.child = child;
    } else {
        existingExpenseTemplate.child = undefined; // Remove child if not provided
    }

    await existingExpenseTemplate.save();
};

exports.delete = async (userId, expenseTemplateId) => {
    // Fetch the existing expense template
    const existingExpenseTemplate = await ExpenseTemplate.findById(
        expenseTemplateId
    );

    // Check if the user making the request is the creator
    const creatorId = existingExpenseTemplate.creator.toString();
    const householdId = existingExpenseTemplate.household.toString();

    const household = await Household.findById(householdId);

    // Check if the household is archived
    if (household.archived) {
        throw new AppError(`Домакинството е архивирано`, 403);
    }

    if (userId.toString() !== creatorId) {
        throw new AppError(
            "Само създателят може да изтрие шаблона",
            403
        );
    }

    // Delete the existing paid expense from the database
    await ExpenseTemplate.findByIdAndDelete(expenseTemplateId);
};
