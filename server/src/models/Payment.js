const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        payer: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, "Полето 'Платец' е задължително"],
        },
        payee: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, "Полето 'Получател' е задължително"],
        },
        amount: {
            type: Number,
            required: [true, "Полето 'Сума' е задължително"],
        },
        date: {
            type: Date,
            required: [true, "Полето 'Дата' е задължително"],
        },
        paymentStatus: {
            type: String,
            enum: {
                values: ["Одобрен", "За одобрение", "Отхвърлен"],
                message:
                    "Невалиден статус на плащането. Позволени стойности са 'Одобрен', 'За одобрение' или 'Отхвърлен'.",
            },
            default: "За одобрение",
        },
        paymentMethod: {
            type: String,
            enum: ["В брой", "Банков превод"],
            required: [true, "Полето 'Метод на плащане' е задължително"],
        },
        bankDetails: {
            payeeIban: {
                type: String,
                required: function () {
                    return this.paymentMethod === "Банков превод";
                },
            },
            payeeFullName: {
                type: String,
                required: function () {
                    return this.paymentMethod === "Банков превод";
                },
            },
            payeeBic: {
                type: String,
                required: function () {
                    return this.paymentMethod === "Банков превод";
                },
            },
            payerIban: {
                type: String,
                required: function () {
                    return this.paymentMethod === "Банков превод";
                },
            },
            payerFullName: {
                type: String,
                required: function () {
                    return this.paymentMethod === "Банков превод";
                },
            },
            paymentDescription: {
                type: String,
            },
        },
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

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
