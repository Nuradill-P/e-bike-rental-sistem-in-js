const express = require('express');
const { requestRental, getUserRentals, getAllRentals, completeRental } = require('../controllers/rentalController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, requestRental);
router.get('/my', verifyToken, getUserRentals);
router.get('/', verifyToken, requireAdmin, getAllRentals);
router.patch('/:id/complete', verifyToken, completeRental);

module.exports = router;
