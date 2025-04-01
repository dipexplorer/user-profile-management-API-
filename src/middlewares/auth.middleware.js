const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const apiError = require("../utils/apiError.js");
const apiResponse = require("../utils/apiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");

const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        req.flash("error", "Access denied. Please log in.");
        return res.redirect("/login");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
        req.user = await User.findById(decoded._id).select("-password");
        if (!req.user) {
            req.flash("error", "user not found. Please log in.");
            return res.redirect("/login");
        }
        next();
    } catch {
        throw new apiError(401, "Invalid access token");
    }
});

module.exports = verifyJWT;
