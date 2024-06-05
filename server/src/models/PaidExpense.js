const mongoose = require("mongoose");

const paidExpenseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        category: { type: String },
        creator: { type: mongoose.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
        date: { type: Date, required: true },
        paidSplitType: {
            type: String,
            enum: ["Единично", "Поравно", "Ръчно"],
            required: true,
        },
        paid: [
            {
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                sum: { type: Number, required: true },
            },
        ],
        owedSplitType: {
            type: String,
            enum: ["Поравно", "Процентно", "Ръчно"],
            required: true,
        },
        owed: [
            {
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                sum: { type: Number, required: true },
            },
        ],
        balance: [
            {
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                sum: { type: Number, required: true },
                type: { type: String, enum: ["+", "-"], required: true },
            },
        ],
        expenseStatus: {
            type: String,
            enum: ["Одобрен", "За одобрение", "Отхвърлен"],
            required: true,
            default: "За одобрение",
        },
        userApprovals: [
            {
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                status: {
                    type: String,
                    enum: ["Одобрен", "За одобрение", "Отхвърлен"],
                    default: "За одобрение",
                },
            },
        ],
        household: {
            type: mongoose.Types.ObjectId,
            ref: "Household",
            required: true,
        },
    },
    // automatically adds and manages createdAt and updatedAt fields 
    { 
        timestamps: true 
    },
);

const PaidExpense = mongoose.model("PaidExpense", paidExpenseSchema);

module.exports = PaidExpense;
