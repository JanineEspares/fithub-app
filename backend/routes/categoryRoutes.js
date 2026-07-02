const express = require('express');

const router = express.Router();

const categoryController = require('../controllers/categoryController');

const authenticate = require('../middleware/authMiddleware');

const authorizeAdmin = require('../middleware/adminMiddleware');

router.post(

    '/',

    authenticate,

    authorizeAdmin,

    categoryController.create

);

module.exports = router;