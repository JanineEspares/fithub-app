const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get(

    '/profile',

    authMiddleware,

    userController.profile

);

router.get(
    '/',
    authMiddleware,
    adminMiddleware,
    userController.listUsers
);

router.patch(
    '/:id/role',
    authMiddleware,
    adminMiddleware,
    userController.updateRole
);

router.patch(
    '/:id/deactivate',
    authMiddleware,
    adminMiddleware,
    userController.deactivateUser
);

module.exports = router;