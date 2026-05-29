const User = require('../Models/User');
const Image = require('../Models/Image');
const fs = require('fs');
const path = require('path');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, bio } = req.body;
        
        const user = await User.findById(req.user._id);
        
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (req.body.avatar) user.avatar = req.body.avatar;
        
        await user.save();
        
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        // Get all images by user
        const userImages = await Image.find({ creator: req.user.id });
        
        // Delete all image files
        userImages.forEach(image => {
            const imagePath = path.join(__dirname, '../uploads', path.basename(image.imageUrl));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });
        
        // Delete all user images from database
        await Image.deleteMany({ creator: req.user.id });
        
        // Delete user
        await User.findByIdAndDelete(req.user.id);
        
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user stats (for dashboard)
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
    try {
        const images = await Image.find({ creator: req.user.id });
        
        let totalLikes = 0;
        let totalViews = 0;
        
        images.forEach(image => {
            totalLikes += image.likes.length;
            totalViews += image.views;
        });
        
        res.status(200).json({
            success: true,
            stats: {
                totalImages: images.length,
                totalLikes,
                totalViews
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getProfile, updateProfile, deleteAccount, getUserStats };