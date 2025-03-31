if (process.env.NODE_ENV != "production") {
    require("dotenv").config(); // Load environment variables
}

const express = require("express");
const app = express();
const cors = require("cors");
const MongoStore = require("connect-mongo");
const path = require("path");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");


// Import User model (Fix for passport authentication)
const User = require("./models/user.js");

// Import Utility Functions
const apiError = require("./utils/apiError.js");
const apiResponse = require("./utils/apiResponse.js");


// CORS Configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:8000",
        credentials: true,
    })
);

// Middleware Setup (✅ Moved to the top)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.use(cookieParser());


// Set up view engine
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


// Session Configuration
const sessionOptions = {
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: false,//do not change it true
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    },
};

app.use(session(sessionOptions));
app.use(flash());


// Middleware to Add Global Variables
app.use((req, res, next) => {
    // console.log("Session Info:", req.session);

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    // ✅ Use session user instead of req.user
    res.locals.currentUser = req.session.user || null;

    next();
});


// Import Routes
const healthCheckRouter = require("./routes/healthCheck_route.js");
const userRoutes = require("./routes/user.routes.js");
const pageRoutes = require('./routes/page.routes');


// ✅ Define the test route first
app.get("/", (req, res) => {
    res.render('pages/index');
});
// API Routes
app.use("/healthcheck", healthCheckRouter);
app.use("/api/users", userRoutes);
app.use('/', pageRoutes);


// Handle 404 Errors
app.all("*", (req, res) => {
    return res.status(404).json(new apiResponse(404, null, "Page not found"));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    return res.status(err.statusCode || 500).json(
        new apiResponse(err.statusCode || 500, null, err.message || "Internal Server Error")
    );
});

module.exports = app;
