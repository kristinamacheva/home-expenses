const Household = require("../models/Household");
const User = require("../models/User");
const PaidExpense = require("../models/PaidExpense");

exports.getAll = (householdId) => PaidExpense.find({ household: householdId });

exports.getOne = (paidExpenseId) => PaidExpense.findById(paidExpenseId);

exports.create = async (paidExpenseData) => {
    try {
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

        // Fetch the admin user by ID
        const creatorUser = await User.findById(creator);
        if (!creatorUser) {
            throw new Error(`Creator user with ID ${creator} not found`);
        }

        const expenseHousehold = await Household.findById(household);
        if (!expenseHousehold) {
            throw new Error(`Household user with ID ${household} not found`);
        }

        // Collect all unique user IDs from paid and owed arrays
        const uniqueUserIds = new Set([
            ...paid.map((p) => p.user.toString()),
            ...owed.map((o) => o.user.toString()),
        ]);

        const userApprovals = Array.from(uniqueUserIds).map((userId) => ({
            user: userId,
            status: userId === creator.toString() ? "Одобрен" : "За одобрение",
        }));

        // Calculate the balance array
        const balance = Array.from(uniqueUserIds).map((userId) => {
            const paidEntry = paid.find((p) => p.user.toString() === userId);
            const owedEntry = owed.find((o) => o.user.toString() === userId);

            const paidSum = paidEntry ? paidEntry.sum : 0;
            const owedSum = owedEntry ? owedEntry.sum : 0;
            const balanceSum = Math.abs(paidSum - owedSum);
            const balanceType = paidSum >= owedSum ? "+" : "-";

            return {
                user: userId,
                sum: balanceSum,
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
            balance
        });

        // Save the household to the database
        await newPaidExpense.save();
        console.log("Paid Expense created:", newPaidExpense);
        return newPaidExpense;
    } catch (error) {
        console.error("Error creating paid expense:", error);
        throw error;
    }
};

exports.update = (paidExpenseId, paidExpenseData) =>
    PaidExpense.findByIdAndUpdate(paidExpenseId, paidExpenseData);

exports.delete = (paidExpenseId) =>
    PaidExpense.findByIdAndDelete(paidExpenseId);
