const express = require('express');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, transactionController.index);
router.get('/:id', authMiddleware, transactionController.show);
router.post('/', authMiddleware, transactionController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin'), transactionController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), transactionController.destroy);

module.exports = router;
