const express = require('express');
const router = express.Router();
const {
    renderHome,
    renderLoginForm,
} = require('../controllers/page.controller.js');


router.get('/', renderHome);
router.get('/login', renderLoginForm);

module.exports = router;
