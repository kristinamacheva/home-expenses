const mongoose = require("mongoose");

const expenseTemplateSchema = new mongoose.Schema(
    {
        templateName: {
            type: String,
            required: [true, "Полето 'Име на шаблон' е задължително"],
        },
        title: {
            type: String,
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: "Category",
            required: [true, "Полето 'Категория' е задължително"],
        },
        creator: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, "Полето 'Създател' е задължително"],
        },
        amount: {
            type: Number,
            required: [true, "Полето 'Сума' е задължително"],
        },
        paidSplitType: {
            type: String,
            enum: {
                values: ["Единично", "Поравно", "Ръчно", ""],
                message:
                    "Невалиден тип на разпределение за плащане. Позволени стойности са 'Единично', 'Поравно' или 'Ръчно'.",
            },
        },
        paid: [
            {
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: "User",
                },
                sum: {
                    type: Number,
                },
            },
        ],
        owedSplitType: {
            type: String,
            enum: {
                values: ["Поравно", "Процентно", "Ръчно", ""],
                message:
                    "Невалиден тип на разпределение на задължение. Позволени стойности са 'Поравно', 'Процентно' или 'Ръчно'.",
            },
        },
        owed: [
            {
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: "User",
                },
                sum: {
                    type: Number,
                },
            },
        ],
        child: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        household: {
            type: mongoose.Types.ObjectId,
            ref: "Household",
            required: [true, "Полето 'Домакинство' е задължително"],
        },
    },
    // automatically adds and manages createdAt and updatedAt fields
    {
        timestamps: true,
    }
);

const ExpenseTemplate = mongoose.model(
    "ExpenseTemplate",
    expenseTemplateSchema
);

module.exports = ExpenseTemplate;
