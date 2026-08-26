const express = require('express');
const { getPendingPayments, confirmPayment, rejectPayment } = require('../controllers/paymentController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/pending', verifyToken, requireAdmin, getPendingPayments);
router.patch('/:id/confirm', verifyToken, requireAdmin, confirmPayment);
router.patch('/:id/reject', verifyToken, requireAdmin, rejectPayment);

module.exports = router;
