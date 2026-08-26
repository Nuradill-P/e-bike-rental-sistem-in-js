const express = require('express');
const { getAllBikes, getBikeById, updateBikeStatus } = require('../controllers/bikeController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllBikes);
router.get('/:id', getBikeById);
router.patch('/:id/status', verifyToken, requireAdmin, updateBikeStatus);

module.exports = router;
