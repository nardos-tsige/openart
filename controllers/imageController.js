const Image = require('../Models/Image');
const path = require('path');
const fs = require('fs');
const { cloudinary } = require('../config/cloudinary');

const getImageUrl = (filename) => {
    return `/uploads/${filename}`;
};

const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const filename = parts.pop();
    const publicId = 'openart/' + filename.split('.')[0];
    return publicId;
};

const uploadImage = async (req, res) => {
    try {
        if (req.user.role !== 'creator' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only creators can upload images'
            });
        }
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }
        
        const { title, description, category, tags } = req.body;
        
        let tagsArray = [];
        if (tags) {
            tagsArray = tags.split(',').map(tag => tag.trim());
        }
        
        // Image URL is already from Cloudinary (multer-storage-cloudinary puts it in req.file.path)
        const image = await Image.create({
            title,
            description: description || '',
            imageUrl: req.file.path,  // Cloudinary URL
            publicId: req.file.filename, // Cloudinary public ID for deletion
            category: category || 'Photography',
            tags: tagsArray,
            creator: req.user._id
        });
        
        res.status(201).json({
            success: true,
            image
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getImages = async (req, res) => {
    try {
        const { category, page = 1, limit = 12 } = req.query;
        let query = {};
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let images = await Image.find(query)
            .populate('creator', 'name avatar')
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit));
        
        // Convert to plain objects
        let plainImages = images.map(img => img.toObject());
        
        // If user is logged in, add liked status
        if (req.user) {
            const userId = req.user._id.toString();
            plainImages = plainImages.map(img => ({
                ...img,
                userLiked: img.likes?.some(id => id.toString() === userId) || false
            }));
        }
        
        const total = await Image.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: plainImages.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            images: plainImages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// In imageController.js - for API calls
const getImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id)
            .populate('creator', 'name email avatar bio')
            .populate('comments.user', 'name avatar');
        
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }
        
        // Increment views
        image.views += 1;
        await image.save();
        
        // Deep conversion to plain object
        const plainImage = JSON.parse(JSON.stringify(image));
        
        res.status(200).json({
            success: true,
            image: plainImage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateImage = async (req, res) => {
    try {
        let image = await Image.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }
        
        const isOwner = image.creator.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this image'
            });
        }
        
        const { title, description, category, tags } = req.body;
        
        if (title) image.title = title;
        if (description !== undefined) image.description = description;
        if (category) image.category = category;
        if (tags) {
            image.tags = tags.split(',').map(tag => tag.trim());
        }
        
        // If new image uploaded, delete old from Cloudinary and add new
        if (req.file) {
            // Delete old image from Cloudinary
            if (image.publicId) {
                await cloudinary.uploader.destroy(image.publicId);
            }
            // Update with new Cloudinary URL
            image.imageUrl = req.file.path;
            image.publicId = req.file.filename;
        }
        
        await image.save();
        
        res.status(200).json({
            success: true,
            image
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }
        
        const isOwner = image.creator.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this image'
            });
        }
        
        // Delete from Cloudinary
        if (image.publicId) {
            await cloudinary.uploader.destroy(image.publicId);
            console.log('Deleted from Cloudinary:', image.publicId);
        }
        
        await image.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const likeImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }
        
        const userId = req.user._id.toString();  // ✅ Convert to string
        const alreadyLiked = image.likes.some(id => id.toString() === userId);  // ✅ Compare as strings
        
        if (alreadyLiked) {
            // Remove like - filter out matching ID
            image.likes = image.likes.filter(id => id.toString() !== userId);
        } else {
            // Add like - push the ObjectId
            image.likes.push(req.user._id);
        }
        
        await image.save();
        
        res.status(200).json({
            success: true,
            likes: image.likes.length,
            liked: !alreadyLiked  // If alreadyLiked was true, now it's false (unliked)
        });
    } catch (error) {
        console.error('Like error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Please add comment text'
            });
        }
        
        const image = await Image.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }
        
        image.comments.push({
            user: req.user._id,
            text
        });
        
        await image.save();
        
        res.status(201).json({
            success: true,
            comment: image.comments[image.comments.length - 1]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    uploadImage,
    getImages,
    getImage,
    updateImage,
    deleteImage,
    likeImage,
    addComment
};