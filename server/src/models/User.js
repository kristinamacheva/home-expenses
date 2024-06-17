const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    avatar: {
        type: String,
        default: '',
    },
    avatarColor: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

userSchema.virtual('repeatPassword').set(function(value) {
    if (value !== this.password) {
        throw new Error('Passsword missmatch!');
    }
});

userSchema.pre('save', async function() {
    const hash = await bcrypt.hash(this.password, 10);

    // delete plain password and save hash in db
    this.password = hash;
});

const User = mongoose.model('User', userSchema);

module.exports = User;