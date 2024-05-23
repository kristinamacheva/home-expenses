const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        // unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

userSchema.virtual('repeatPassword')
    .set(function(value) {
        if (value !== this.password) {
            throw new Error('Passsword missmatch!');
        }
    });

const User = mongoose.model('User', userSchema);

module.exports = User;