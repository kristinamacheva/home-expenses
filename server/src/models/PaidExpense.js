const mongoose = require("mongoose");

const paidExpenseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Полето 'Заглавие' е задължително"],
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: 'Category',
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
        date: { type: Date, required: [true, "Полето 'Дата' е задължително"] },
        paidSplitType: {
            type: String,
            enum: {
                values: ["Единично", "Поравно", "Ръчно"],
                message:
                    "Невалиден тип на разпределение за плащане. Позволени стойности са 'Единично', 'Поравно' или 'Ръчно'.",
            },
            required: [
                true,
                "Полето 'Тип на разпределение за плащане' е задължително",
            ],
        },
        paid: [
            {
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: "User",
                    required: [true, "Полето 'Платец' е задължително"],
                },
                sum: {
                    type: Number,
                    required: [true, "Полето 'Сума за плащане' е задължително"],
                },
            },
        ],
        owedSplitType: {
            type: String,
            enum: {
                values: ["Поравно", "Процентно", "Ръчно"],
                message:
                    "Невалиден тип на разпределение на задължение. Позволени стойности са 'Поравно', 'Процентно' или 'Ръчно'.",
            },
            required: [
                true,
                "Полето 'Тип на разпределение на задължение' е задължително",
            ],
        },
        owed: [
            {
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: "User",
                    required: [
                        true,
                        "Полето 'Потребител за дължима сума' е задължително",
                    ],
                },
                sum: {
                    type: Number,
                    required: [true, "Полето 'Дължима сума' е задължително"],
                },
            },
        ],
        child: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        balance: [
            {
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: "User",
                    required: [
                        true,
                        "Полето 'Потребител за баланс' е задължително",
                    ],
                },
                sum: {
                    type: Number,
                    required: [true, "Полето 'Сума за баланс' е задължително"],
                },
                type: {
                    type: String,
                    enum: {
                        values: ["+", "-"],
                        message:
                            "Невалиден тип на баланс. Позволени стойности са '+' или '-'.",
                    },
                    required: [true, "Полето 'Тип на баланс' е задължително"],
                },
            },
        ],
        expenseStatus: {
            type: String,
            enum: {
                values: ["Одобрен", "За одобрение", "Отхвърлен"],
                message:
                    "Невалиден статус на разхода. Позволени стойности са 'Одобрен', 'За одобрение' или 'Отхвърлен'.",
            },
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
                    enum: {
                        values: ["Одобрен", "За одобрение", "Отхвърлен"],
                        message:
                            "Невалиден статус за одобрение. Позволени стойности са 'Одобрен', 'За одобрение' или 'Отхвърлен'.",
                    },
                    default: "За одобрение",
                },
            },
        ],
        comments: [
            {
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                text: {
                    type: String,
                    required: [true, "Полето 'Текст' е задължително"],
                },
                createdAt: { type: Date, default: Date.now },
            },
        ],
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

const PaidExpense = mongoose.model("PaidExpense", paidExpenseSchema);

module.exports = PaidExpense;
