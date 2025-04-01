const express = require('express');
const router = express.Router();
const {
    renderHome,
    renderLoginForm,
} = require('../controllers/page.controller.js');

const { account, renderUpdateForm } = require('../controllers/user.controllers.js');


router.get('/', renderHome);
router.get('/login', renderLoginForm);
router.get('/account', account);
router.get('/account/update', renderUpdateForm);

module.exports = router;
