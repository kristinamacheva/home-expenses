const Household = require("../models/Household");
const User = require("../models/User");
const Category = require("../models/Category");
const { AppError } = require("../utils/AppError");
const { default: mongoose } = require("mongoose");
const PaidExpense = require("../models/PaidExpense");
const { ObjectId } = require("mongoose").Types;

exports.getAll = async (householdId) => {
    const household = await Household.findById(householdId).lean();

    return await Category.aggregate([
        { $match: { _id: { $in: household.categories } } },
        {
            $project: {
                _id: 1,
                title: 1,
            },
        },
        { $sort: { title: 1 } },
    ]);
};

exports.getAllDetails = async (householdId, page, limit) => {
    const household = await Household.findById(householdId).lean();

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    const categories = await Category.aggregate([
        { $match: { _id: { $in: household.categories } } },
        { $sort: { title: 1 } }, // Sort categories by title alphabetically
        { $skip: skip }, // Skip the first (page - 1) * limit documents
        { $limit: limit }, // Limit the number of documents returned
        {
            $lookup: {
                from: "users", // The name of the users collection
                localField: "creator",
                foreignField: "_id",
                as: "creator",
            },
        },
        {
            $unwind: {
                path: "$creator",
                preserveNullAndEmptyArrays: true, // Handle cases where creator might be null
            },
        },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                predefined: 1,
                "creator._id": 1,
                "creator.name": 1,
                "creator.avatar": 1,
                "creator.avatarColor": 1,
            },
        },
    ]);

    // Count total number of categories for pagination info
    const totalCount = await Category.countDocuments({
        _id: { $in: household.categories },
    });

    return {
        categories,
        totalCount,
    };
};

exports.create = async (categoryData) => {
    const { title, description, creator, household } = categoryData;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if the creator is a member of the household
        const householdExists = await Household.exists({
            _id: new ObjectId(household),
            "members.user": creator,
        }).session(session); // Use the transaction session here

        if (!householdExists) {
            throw new AppError(`Платецът не е член на домакинството`, 403);
        }

        // Check if the household is archived
        if (householdExists.archived) {
            throw new AppError(`Домакинството е архивирано`, 403);
        }

        // Create and save the new category
        const newCategory = new Category({
            title,
            description,
            creator,
            household,
        });
        await newCategory.save({ session });

        // Update the household to include the new category
        await Household.findByIdAndUpdate(
            household,
            { $push: { categories: newCategory._id } },
            { new: true, session }
        );

        await session.commitTransaction();
        session.endSession();

        return newCategory;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

exports.getOne = (categoryId) =>
    Category.findById(categoryId).select("_id title description").lean();

exports.update = async (categoryData) => {
    const { userId, categoryId, title, description } = categoryData;

    // Fetch the existing category
    const existingCategory = await Category.findById(categoryId);

    // Fetch the household by ID
    const categoryHousehold = await Household.findById(
        existingCategory.household
    );

    // Check if the household is archived
    if (categoryHousehold.archived) {
        throw new AppError(`Домакинството е архивирано`, 403);
    }

    // Check if the user is the creator of the category
    const isCreator = existingCategory.creator.toString() === userId.toString();

    // Check if the user is an admin of the household
    const isAdmin = categoryHousehold.admins.some(
        (adminId) => adminId.toString() === userId.toString()
    );

    // If the user is not the creator and not an admin, throw an error
    if (!isCreator && !isAdmin) {
        throw new AppError(
            "Само създателят или админите могат да редактират категорията",
            403
        );
    }

    // Update the category fields
    existingCategory.title = title;
    existingCategory.description = description;

    // Save the updated category to the database
    await existingCategory.save();
};

exports.delete = async (userId, categoryId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Fetch the existing category
        const existingCategory = await Category.findById(categoryId).session(
            session
        );

        // Fetch the household by ID
        const categoryHousehold = await Household.findById(
            existingCategory.household
        ).session(session);

        // Check if the household is archived
        if (categoryHousehold.archived) {
            throw new AppError(`Домакинството е архивирано`, 403);
        }

        // Check if the user is the creator of the category
        const isCreator =
            existingCategory.creator.toString() === userId.toString();

        // Check if the user is an admin of the household
        const isAdmin = categoryHousehold.admins.some(
            (adminId) => adminId.toString() === userId.toString()
        );

        // If the user is not the creator and not an admin, throw an error
        if (!isCreator && !isAdmin) {
            throw new AppError(
                "Само създателят или админите могат да изтрият категорията",
                403
            );
        }

        // Remove the category from the household's categories array
        categoryHousehold.categories.pull(categoryId);
        await categoryHousehold.save({ session });

        // Find the uncategorized category
        const uncategorizedCategory = await Category.findOne({
            title: "Некатегоризиран",
        }).session(session);
        if (!uncategorizedCategory) {
            throw new AppError(
                "Категорията 'Некатегоризиран' не е намерена",
                404
            );
        }

        // Update all expenses with the deleted category to use 'Некатегоризиран'
        await PaidExpense.updateMany(
            { category: categoryId },
            { category: uncategorizedCategory._id },
            { session }
        );

        // Delete the existing category from the database
        await Category.findByIdAndDelete(categoryId).session(session);

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
