const mongoose = require('mongoose');
const Payment = require('../models/Payment');

const getPayment = async (req, res, next) => {
    const paymentId = req.params.paymentId;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
        return res.status(404).json({ message: 'Invalid payment ID format' });
    }

    try {
        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        req.paymentId = paymentId;

        next();
    } catch (error) {
        console.error('Error fetching payment:', error);
        return res.status(500).json({ message: 'Error fetching payment' });
    }
}

module.exports = getPayment;