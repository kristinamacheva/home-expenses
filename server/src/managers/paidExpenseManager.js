const Household = require("../models/Household");
const User = require("../models/User");
const PaidExpense = require("../models/PaidExpense");

exports.getAll = async (userId, householdId) => {
    const paidExpenses = await PaidExpense.find({ household: householdId })
        .select("_id title category creator amount date expenseStatus balance")
        .lean();

    // Filter balance array for the current user
    paidExpenses.forEach((expense) => {
        expense.balance = expense.balance.filter(
            (entry) => entry.user.toString() === userId
        );
    });

    return paidExpenses;
};

exports.getOne = (paidExpenseId) => PaidExpense.findById(paidExpenseId);

exports.getOneDistributionDetails = async (paidExpenseId, userId) => {
    try {
        const paidExpense = await PaidExpense.findById(paidExpenseId)
            .populate("creator", "_id name avatar avatarColor")
            .populate("balance.user", "_id name avatar avatarColor")
            .select("_id creator balance paid owed expenseStatus userApprovals");

        // Filter userApprovals to only include the current user's status
        const currentUserApproval = paidExpense.userApprovals.find(entry => entry.user.equals(userId));

        if (currentUserApproval) {
            // Modify paidExpense object to only include currentUserApproval
            paidExpense.userApprovals = [currentUserApproval];
        } else {
            // If current user has no approval entry
            paidExpense.userApprovals = [];
        }

        return paidExpense;
    } catch (error) {
        console.error("Error fetching paid expense details:", error);
        throw error;
    }
};

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

        // TODO: if there is only 1 user in the group, he cant create expenses

        // Fetch the admin user by ID
        const expenseCreator = await User.findById(creator);
        const expenseHousehold = await Household.findById(household);

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
                throw new Error(
                    `User with ID ${userId} is not a member of the household`
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
            throw new Error(
                "Total paid amount does not match total owed amount"
            );
        }

        // Check if the total amount matches the sum of paid and owed amounts
        if (totalPaid !== amountInCents) {
            throw new Error(
                "Total paid/owed amount does not match the specified amount"
            );
        }

        // TODO: calculate only to 2nd symbol
        // TODO: Calculate in cents
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

        console.log(newPaidExpense);

        // Save the household to the database
        await newPaidExpense.save();
        console.log("Paid Expense created:", newPaidExpense);

        return newPaidExpense;
    } catch (error) {
        console.error("Error creating paid expense:", error);
        throw error;
    }
};

const updateBalance = async (houesholdId, expenseId) => {
    try {
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
        });

        await expenseHousehold.save();
        console.log("Household balance updated:", expenseHousehold);
    } catch (error) {
        console.error("Error updating household balance:", error);
        throw error;
    }
};

exports.accept = async (userId, paidExpenseId) => {
    try {
        const paidExpense = await PaidExpense.findById(paidExpenseId);

        // Check if the overall expense status is "За одобрение"
        if (paidExpense.expenseStatus !== "За одобрение") {
            throw new Error(
                `The expense status must be "За одобрение" to approve user statuses`
            );
        }

        const userApproval = paidExpense.userApprovals.find((entry) =>
            entry.user.equals(userId)
        );

        if (!userApproval) {
            throw new Error(`User not found in approvals`);
        }

        // Check if the current user approval status is "За одобрение"
        if (userApproval.status !== "За одобрение") {
            throw new Error(`User cannot approve/reject more than once`);
        }

        // Update status to "Одобрен"
        userApproval.status = "Одобрен";

        // Check if all user approvals are now "Одобрен"
        const allApproved = paidExpense.userApprovals.every(
            (entry) => entry.status === "Одобрен"
        );

        if (allApproved) {
            paidExpense.expenseStatus = "Одобрен";

            // Try updating the balance and handle potential errors
            try {
                await updateBalance(paidExpense.household, paidExpenseId);
            } catch (balanceError) {
                console.error("Error updating balance:", balanceError);
                throw new Error("Failed to update balance");
            }
        }

        // Save the updated paid expense to the database
        await paidExpense.save();
        console.log("Paid Expense accepted:", paidExpense);

        return paidExpense;
    } catch (error) {
        console.error("Error accepting paid expense:", error);
        throw error;
    }
};

exports.reject = async (userId, paidExpenseId) => {
    try {
        const paidExpense = await PaidExpense.findById(paidExpenseId);

        // Check if the overall expense status is "За одобрение"
        if (paidExpense.expenseStatus !== "За одобрение") {
            throw new Error(
                `The expense status must be "За одобрение" to reject user statuses`
            );
        }

        const userApproval = paidExpense.userApprovals.find((entry) =>
            entry.user.equals(userId)
        );

        if (!userApproval) {
            throw new Error(`User not found in approvals`);
        }

        // Check if the current user approval status is "За одобрение"
        if (userApproval.status !== "За одобрение") {
            throw new Error(`User cannot approve/reject more than once`);
        }

        // Update status to "Отхвърлен"
        userApproval.status = "Отхвърлен";
        paidExpense.expenseStatus = "Отхвърлен";

        // Save the updated paid expense to the database
        await paidExpense.save();
        console.log("Paid Expense rejected:", paidExpense);

        return paidExpense;
    } catch (error) {
        console.error("Error rejecting paid expense:", error);
        throw error;
    }
};

exports.update = (paidExpenseId, paidExpenseData) =>
    PaidExpense.findByIdAndUpdate(paidExpenseId, paidExpenseData);

exports.delete = (paidExpenseId) =>
    PaidExpense.findByIdAndDelete(paidExpenseId);
