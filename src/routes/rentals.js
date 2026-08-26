const express = require('express');
const { requestRental, getUserRentals, getAllRentals } = require('../controllers/rentalController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, requestRental);
router.get('/my', verifyToken, getUserRentals);
router.get('/', verifyToken, requireAdmin, getAllRentals);

module.exports = router;
