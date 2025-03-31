const apiError = require("../utils/apiError.js");
const apiResponse = require("../utils/apiResponse.js");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        if (!accessToken || !refreshToken) {
            throw new Error("Failed to generate tokens");
        }

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (err) {
        throw new Error("Error generating access and refresh tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // console.log("Received Body:", req.body);
    const { name, email, password, confirmPassword, address, bio, profilePic } = req.body;

    // Validate required fields
    if (!name || !email || !password || !address || !confirmPassword) {
        // throw new apiError(400, "All fields are required");
        req.flash('error', "All fields are required");
        return res.redirect('/login');
    }

    if (password !== confirmPassword) {
        req.flash('error', "Passwords do not match");
        return res.redirect('/login');
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ name }, { email }] });
    if (userExists) {
        req.flash('error', "User already exists");
        return res.redirect('/login');
    }

    // Create user in DB
    try {
        const user = await User.create({
            name,
            email,
            password,
            address,
            bio,
            profilePic,
        });

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        if (!createdUser) {
            // throw new apiError(500, "Failed to create user");
            req.flash('error', "Failed to create user");
            return res.redirect('/login');
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        // Store user session
        req.session.user = {
            _id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
        };

        res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "Lax" });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Lax" });

        // res.status(201).json(new apiResponse(201, { user, accessToken, refreshToken }, "User registered successfully"));
        req.flash('success', 'Welcome! Account created successfully.');
        return res.redirect('/');
    } catch (err) {
        console.error("Error creating user:", err);
        // throw new apiError(
        //     500,
        //     "Failed to create user."
        // );
        req.flash('error', "Failed to create user");
        return res.redirect('/login');
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        req.flash('error', "All fields are required");
        return res.redirect('/login');
    }

    let user = await User.findOne({ email }).select("+password +refreshToken");

    if (!user) {
        // throw new apiError(401, "User not found");
        req.flash('error', "User not found");
        return res.redirect('/login');
    }

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
        // throw new apiError(401, "Invalid password");
        req.flash('error', "Invalid password");
        return res.redirect('/login');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    if (!accessToken || !refreshToken) {
        // throw new apiError(500, "Token generation failed");
        req.flash('error', "Token generation failed");
        return res.redirect('/login');
    }

    // ✅ Store user session
    req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email
    };

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "Lax" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Lax" });

    // res.status(200).json(new apiResponse(200, { user, accessToken, refreshToken }, "Logged in successfully"));
    req.flash('success', 'Welcome! Logged in successfully.');
    return res.redirect('/');
});


const logOutUser = asyncHandler(async (req, res) => {
    // console.log("Cookies Received in Logout:", req.cookies);
    // console.log("User Session Before Logout:", req.session.user);

    if (!req.session.user) {
        req.flash('error', "No user is logged in.");
        return res.redirect('/login');
    }

    try {
        // ✅ Remove refreshToken from DB
        await User.findByIdAndUpdate(req.session.user._id, { $unset: { refreshToken: "" } });

        // ✅ Set flash message BEFORE destroying session
        req.flash('success', "Logged out successfully!");

        // ✅ Destroy session with callback
        req.session.destroy((err) => {
            if (err) {
                console.error("Session Destroy Error:", err);
                return res.redirect('/');
            }

            // ✅ Properly clear cookies
            res.clearCookie("accessToken", { path: '/' });
            res.clearCookie("refreshToken", { path: '/' });

            return res.redirect('/login');
        });

    } catch (err) {
        console.error("Error in Logout:", err);
        req.flash('error', "Something went wrong. Try again.");
        return res.redirect('/');
    }
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    console.log("Cookies Received in Refresh Token:", req.cookies);  // Debugging

    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(401, "No refresh token provided");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.JWT_REFRESH_TOKEN_SECRET
        );

        console.log("Decoded Token:", decodedToken);  // Debugging

        if (!decodedToken) {
            throw new apiError(401, "Invalid token");
        }

        const userId = decodedToken._id;
        const user = await User.findById(userId);

        if (!user) {
            throw new apiError(401, "User not found");
        }

        console.log("User Found:", user);  // Debugging

        // Check if the refresh token matches the one in the user's database
        if (user.refreshToken !== incomingRefreshToken) {
            throw new apiError(401, "Refresh token mismatch or expired");
        }

        // Generate new access and refresh tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(userId);

        // Set the new tokens in cookies
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            sameSite: "lax", // Recommended setting for cross-site requests
            maxAge: 24 * 60 * 60 * 1000, // Set expiration for the cookie (24 hours)
        };

        // Send response with new tokens in cookies
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new apiResponse(200, { accessToken, refreshToken }, "Access token refreshed successfully"));
    } catch (err) {
        console.error("JWT Verification Error:", err.name, err.message);
        throw new apiError(401, err.message || "Invalid refresh token");
    }
});



const changeCurrentPassword = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const { oldPassword, newPassword } = req.body;
    console.log("Received Body:", req.body);

    // validate required fields
    if (!oldPassword || !newPassword) {
        throw new apiError(400, "All fields are required");
    }
    // find user
    let user = await User.findById(userId);
    if (!user) {
        throw new apiError(401, "User not found");
    }
    // validate old password
    const isMatch = await user.isPasswordCorrect(oldPassword);
    if (!isMatch) {
        throw new apiError(401, "Incorrect old password");
    }
    // update password
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new apiResponse(200, null, "Password updated successfully"));
});

const currentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                req.user,
                "User details retrieved successfully"
            )
        );
});

const updateUserDetails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { fullname } = req.body;
    if (!fullname) {
        throw new apiError(400, "Full name is required");
    }
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: { fullname },
        },
        { new: true }
    ).select("-password -refreshToken");
    return res
        .status(200)
        .json(new apiResponse(200, user, "User details updated successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username) {
        throw new apiError(400, "Username is required");
    }
    const user = await User.findOne({ username }).select("-password -refreshToken");
    if (!user) {
        throw new apiError(404, "User not found");
    }
    return res
        .status(200)
        .json(new apiResponse(200, user, "User profile retrieved successfully"));

});


module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    logOutUser,
    changeCurrentPassword,
    currentUser,
    updateUserDetails,
    getUserProfile,
};
