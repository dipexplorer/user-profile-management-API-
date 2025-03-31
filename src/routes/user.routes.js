const express = require("express");
const {
    registerUser,
    loginUser,
    refreshAccessToken,
    logOutUser,
    changeCurrentPassword,
    currentUser,
    updateUserDetails,
    getUserProfile,
} = require("../controllers/user.controllers.js");

const verifyJWT = require("../middlewares/auth.middleware.js");

const router = express.Router();

// ✅ Log Incoming Requests for Debugging
router.use((req, res, next) => {
    console.log("Incoming Request - Method:", req.method, " Path:", req.path);
    next();
});

// ✅ Register Route (with file upload)
router.route("/register").post(registerUser);

// ✅ Login Route (Fix Empty Body Issue)
router.route("/login").post(loginUser);

// ✅ Secure  Route
router.route("/logout").get(logOutUser);
// ✅ Refresh Access Token Route
router.route("/refresh-token").post(refreshAccessToken);

// ✅ User Profile Routes
router.route("/account").get(verifyJWT, currentUser);
router.route("/update-profile").put(verifyJWT, updateUserDetails);

// ✅ User password change route or Security Route
router.route("/change-password").put(verifyJWT, changeCurrentPassword);


// ✅ User Profile Routes
router.route("/profile/:username").get(verifyJWT, getUserProfile);

module.exports = router;
