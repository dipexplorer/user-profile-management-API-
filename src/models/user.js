const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// user schema
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "password is required"],
        },
        address: {
            type: String,
            required: [true, "address is required"],
        },
        bio: {
            type: String,
        },
        profilePic: {
            type: String,
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email,
        },
        process.env.JWT_ACCESS_TOKEN_SECRET, // ✅ Ensure this is correctly set
        {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY || "1d",
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.JWT_REFRESH_TOKEN_SECRET, // ✅ Ensure this is correctly set
        {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d",
        }
    );
};

// export
module.exports = mongoose.model("User", userSchema);
