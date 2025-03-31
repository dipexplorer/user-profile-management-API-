const asyncHandler = require('../utils/asyncHandler.js');
const ApiError = require('../utils/apiError.js');
const ApiResponse = require('../utils/apiResponse.js');

const renderHome = (req, res) => {
    res.render('pages/index');
};
const renderLoginForm = async (req, res) => {
    res.render('users/login');
}

module.exports = {
    renderHome,
    renderLoginForm,
};
