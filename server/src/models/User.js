const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Името е задължително поле"],
    },
    email: {
        type: String,
        required: [true, "Имейлът е задължително поле"],
        unique: {
            value: true,
            message: "Имейлът е зает",
        },
        lowercase: true,
    },
    phone: {
        type: String,
        // unique: true,
    },
    avatar: {
        type: String,
        default: "",
    },
    avatarColor: {
        type: String,
        required: [true, "Цветът на аватара е задължително поле"],
        match: [/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, "Невалиден цвят на аватара"],
    },
    password: {
        type: String,
        required: [true, "Паролата е задължително поле"],
        minLength: [8, "Паролата трябва да е поне 8 символа"],
    },
});

userSchema.virtual("repeatPassword").set(function (value) {
    if (value !== this.password) {
        throw new Error("Паролите не съвпадат!");
    }
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const hash = await bcrypt.hash(this.password, 10);

    // delete plain password and save hash in db
    this.password = hash;
});

// Define the toJSON method to remove sensitive information
userSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret, options) {
        delete ret.password;
        return ret;
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
