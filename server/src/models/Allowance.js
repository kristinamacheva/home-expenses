const mongoose = require('mongoose');

const allowanceSchema = new mongoose.Schema(
    {
        child: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: [true, "Полето 'Дете' е задължително"],
        },
        household: {
            type: mongoose.Types.ObjectId,
            ref: "Household",
            required: [true, "Полето 'Домакинство' е задължително"],
        },
        amount: {
            type: Number,
            required: [true, "Полето 'Сума' е задължително"],
        },
    },
    // automatically adds and manages createdAt and updatedAt fields
    {
        timestamps: true,
    }
);

const Allowance = mongoose.model('Allowance', allowanceSchema);

module.exports = Allowance;
