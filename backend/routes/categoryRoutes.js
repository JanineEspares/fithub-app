const express = require('express');

const router = express.Router();

const categoryController = require('../controllers/categoryController');
const categoryAdminController = require('../controllers/categoryAdminController');

const authenticate = require('../middleware/authMiddleware');
const authorizeAdmin = require('../middleware/adminMiddleware');

router.get(
    '/',
    categoryController.getAllCategories
);

router.post(
    '/',
    authenticate,
    authorizeAdmin,
    categoryController.createCategory
);

router.put(
    '/:id',
    authenticate,
    authorizeAdmin,
    categoryAdminController.update
);

router.delete(
    '/:id',
    authenticate,
    authorizeAdmin,
    categoryAdminController.remove
);

module.exports = router;