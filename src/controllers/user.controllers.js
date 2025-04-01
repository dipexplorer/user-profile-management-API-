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
    const { name, password } = req.body;

    if (!name || !password) {
        req.flash('error', "All fields are required");
        return res.redirect('/login');
    }

    let user = await User.findOne({ name }).select("+password +refreshToken");

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
    // console.log("Cookies Received in Refresh Token:", req.cookies); // Debugging
    // console.log("Body Received in Refresh Token:", req.body); // Debugging

    // ✅ Ensure refreshToken is extracted correctly
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        console.error("❌ No refresh token found in cookies or body.");
        req.flash('error', "Session expired. Please log in again.");
        return res.redirect('/login');
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
        // console.log("✅ Decoded Token:", decodedToken);

        if (!decodedToken) {
            console.error("❌ Invalid token during verification.");
            req.flash('error', "Invalid session. Please log in again.");
            return res.redirect('/login');
        }

        const userId = decodedToken._id;
        const user = await User.findById(userId);

        if (!user) {
            console.error("❌ User not found for ID:", userId);
            req.flash('error', "User not found. Please log in again.");
            return res.redirect('/login');
        }

        console.log("✅ User Found:", user);

        // ✅ Ensure refresh token matches the one stored in the database
        if (user.refreshToken !== incomingRefreshToken) {
            console.error("❌ Refresh token mismatch.");
            req.flash('error', "Session expired. Please log in again.");
            return res.redirect('/login');
        }

        // ✅ Generate new access and refresh tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(userId);

        // ✅ Set the new tokens in cookies
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 24 * 60 * 60 * 1000
        };

        // ✅ Send new tokens in response
        req.flash('success', "Session refreshed successfully!");
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .redirect('/'); // Redirect to home or dashboard
    } catch (err) {
        console.error("JWT Verification Error:", err.name, err.message);;
        req.flash('error', "Session expired. Please log in again.");
        return res.redirect('/login');
    }
});



const account = asyncHandler(async (req, res) => {
    if (!req.session.user) {
        req.flash('error', "No user is logged in.");
        return res.redirect('/login');
    }
    try {
        const user = await User.findById(req.session.user._id).select("-password -refreshToken");
        if (!user) {
            req.flash('error', "User not found.");
            return res.redirect('/login');
        }
        // res.status(200).json(new apiResponse(200, user, "User found successfully"));
        return res.render('users/profile', { user });
    } catch (err) {
        console.error("Error fetching user:", err);
        req.flash('error', "Failed to fetch user.");
        return res.redirect('/login');
    }
});

// 📌 render updateform
const renderUpdateForm = asyncHandler(async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const user = await User.findById(req.session.user._id).select('-password');
    if (!user) {
        return res.redirect('/login');
    }
    res.render('users/updateUser', { user });
})

const updateProfile = asyncHandler(async (req, res) => {
    const { name, email, password, address, bio, profilePic } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(req.session.user._id);

        if (!user) {
            req.flash('error', "User not found.");
            return res.redirect('/account');
        }

        // Check if the email or name already exists (other than the current user)
        const userExists = await User.findOne({
            $or: [{ email }, { name }],
            _id: { $ne: req.session.user._id }, // Ensure it's not the same user
        });

        if (userExists) {
            req.flash('error', "Email or Name already in use.");
            return res.redirect('/profile');
        }

        // Update user fields
        user.name = name;
        user.email = email;
        user.address = address;
        user.bio = bio || user.bio; // Keep existing bio if not provided
        user.profilePic = profilePic || user.profilePic; // Keep existing profilePic if not provided

        // Save the updated user
        await user.save();

        // Update session user data
        req.session.user.name = user.name;
        req.session.user.email = user.email;

        req.flash('success', "Profile updated successfully.");
        return res.redirect('/account'); // Redirect to the profile page
    } catch (err) {
        console.error("Error updating user details:", err);
        req.flash('error', "Something went wrong. Please try again.");
        return res.redirect('/account'); // Redirect back with error message
    }
});

// 📌 Delete User
const deleteUser = asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.session.user._id);
    req.flash('success', "Account deleted successfully!");
    return res.redirect('/login');
});


module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    logOutUser,
    account,
    renderUpdateForm,
    updateProfile,
    deleteUser,
};
