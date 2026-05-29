const express = require('express');
const {
    getProfile,
    updateProfile,
    deleteAccount,
    getUserStats
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/account', protect, deleteAccount);
router.get('/stats', protect, getUserStats);

module.exports = router;