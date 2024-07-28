const Allowance = require("../models/Allowance");
const { default: mongoose } = require("mongoose");
const { ObjectId } = require("mongoose").Types;

exports.getAll = async (userId, householdId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    // Convert to ObjectId if they are strings
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const householdObjectId = new mongoose.Types.ObjectId(householdId);

    // Match conditions
    const matchConditions = {
        household: householdObjectId,
        child: userObjectId,
    };

    // Aggregation pipeline to fetch allowances
    const pipeline = [
        { $match: matchConditions },
        { $sort: { createdAt: -1, _id: -1 } }, // Sort by createdAt and _id in descending order
        { $skip: skip }, // Pagination: Skip records
        { $limit: limit }, // Pagination: Limit records
    ];

    // Execute aggregation pipeline
    const allowances = await Allowance.aggregate(pipeline);

    // Count total number of documents matching the conditions
    const totalCount = await Allowance.countDocuments(matchConditions);

    return { allowances, totalCount };
};

exports.getOne = (allowanceId) => Allowance.findById(allowanceId).lean();
