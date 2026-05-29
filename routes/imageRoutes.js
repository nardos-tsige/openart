const express = require('express');
const {
    uploadImage,
    getImages,
    getImage,
    updateImage,
    deleteImage,
    likeImage,
    addComment
} = require('../controllers/imageController');
const { protect, authorize } = require('../middleware/auth');
const uploadImageMiddleware = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getImages);
router.get('/:id', getImage);

// Protected routes
router.post('/upload', protect, authorize('creator', 'admin'), uploadImageMiddleware, uploadImage);
router.put('/:id', protect, uploadImageMiddleware, updateImage);
router.delete('/:id', protect, deleteImage);
router.post('/:id/like', protect, likeImage);
router.post('/:id/comment', protect, addComment);

module.exports = router;