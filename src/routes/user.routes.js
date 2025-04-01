const express = require("express");
const {
    registerUser,
    loginUser,
    refreshAccessToken,
    logOutUser,
    updateProfile,
    deleteUser
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


// ✅ Update User Profile Route (with file upload)
router.route("/update").put(verifyJWT, updateProfile);

router.route("/delete").delete(deleteUser);


module.exports = router;
