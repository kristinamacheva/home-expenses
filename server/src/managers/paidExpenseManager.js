const Household = require("../models/Household");
const User = require("../models/User");
const PaidExpense = require("../models/PaidExpense");

exports.getAll = (householdId) => {
    return PaidExpense.find({ household: householdId })
        .select('_id title category creator amount date balance expenseStatus');
};

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

        console.log(paid);
        console.log(owed);
        console.log(uniqueUserIds);

        // TODO: Test
        // Check if all users are members of the household
        for (const userId of uniqueUserIds) {
            if (!householdMemberIds.includes(userId)) {
                throw new Error(`User with ID ${userId} is not a member of the household`);
            }
        }

        const userApprovals = Array.from(uniqueUserIds).map((userId) => ({
            user: userId,
            status: userId === creator.toString() ? "Одобрен" : "За одобрение",
        }));

        // Calculate the total paid and owed sums
        const totalPaid = paid.reduce((sum, entry) => sum + entry.sum, 0);
        const totalOwed = owed.reduce((sum, entry) => sum + entry.sum, 0);

        if (totalPaid !== totalOwed) {
            throw new Error('Total paid amount does not match total owed amount');
        }

        // Check if the total amount matches the sum of paid and owed amounts
        if (totalPaid !== amount) {
            throw new Error('Total paid/owed amount does not match the specified amount');
        }

        // TODO: calculate only to 2nd symbol
        // TODO: Calculate in cents
        // Calculate the balance array
        const balance = Array.from(uniqueUserIds).map((userId) => {
            const paidEntry = paid.find((p) => p.user === userId);
            const owedEntry = owed.find((o) => o.user === userId);

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
            balance,
        });

        console.log(`title : ${title}`);
        console.log(newPaidExpense);

        // Save the household to the database
        await newPaidExpense.save();
        console.log("Paid Expense created:", newPaidExpense);

        // TODO: do this only when all users have approved
        // Update the household balance based on the new balance of the expense
        balance.forEach(newEntry => {
            const existingEntry = expenseHousehold.balance.find(entry => entry.user.equals(newEntry.user));
        
            // Determine the current sum considering the current type
            let currentSum = existingEntry.type === '+' ? existingEntry.sum : -existingEntry.sum;

            // Update the sum based on the type of operation
            newEntry.type === '+' ? currentSum += newEntry.sum : currentSum -= newEntry.sum;
        
            // Update the type based on the sum and ensure the sum is always positive
            if (currentSum >= 0) {
                existingEntry.sum = currentSum;
                existingEntry.type = '+';
            } else {
                existingEntry.sum = Math.abs(currentSum);
                existingEntry.type = '-';
            }
        });

        await expenseHousehold.save();
        console.log("Household balance updated:", expenseHousehold);

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
