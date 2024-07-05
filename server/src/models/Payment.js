const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Полето 'Заглавие' е задължително"],
        },
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
                message: "Невалиден статус на плащането. Позволени стойности са 'Одобрен', 'За одобрение' или 'Отхвърлен'.",
            },
            default: "За одобрение",
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

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
