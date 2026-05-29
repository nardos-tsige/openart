const express = require('express');
const Image = require('../Models/Image');
const User = require('../Models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: Format date
const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Home page
router.get('/', async (req, res) => {
    try {
        const images = await Image.find()
            .populate('creator', 'name avatar')
            .sort('-createdAt')
            .limit(12);
        res.render('home', {
            title: 'Home',
            images,
            formatDate
        });
    } catch (error) {
        res.render('home', {
            title: 'Home',
            images: [],
            formatDate
        });
    }
});

// Login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

// Register page
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

// Dashboard page
router.get('/dashboard', async (req, res) => {
    // Get token from cookie or header
    let token = req.cookies.token;
    
    if (!token) {
        return res.redirect('/login');
    }
    
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.redirect('/login');
        }
        
        const images = await Image.find({ creator: user.id }).sort('-createdAt');
        
        let totalLikes = 0;
        let totalViews = 0;
        
        // Convert images to plain objects and calculate stats
        const plainImages = images.map(img => {
            const plainImg = img.toObject();
            totalLikes += plainImg.likesCount || plainImg.likes?.length || 0;
            totalViews += plainImg.views || 0;
            return plainImg;
        });
        
        res.render('dashboard', {
            title: 'Dashboard',
            user: user.toObject(),  // ✅ Convert user to plain object
            images: plainImages,     // ✅ Convert images to plain objects
            stats: {
                totalImages: plainImages.length,
                totalLikes,
                totalViews
            },
            formatDate
        });
    } catch (error) {
        res.redirect('/login');
    }
});

// Upload page - only creator and admin
router.get('/upload', protect, (req, res) => {    
    if (req.user.role !== 'creator' && req.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }
    res.render('upload', { title: 'Upload Artwork' });
});

// Image detail page
router.get('/image/:id', async (req, res) => {
    try {
    console.log("Fetching image:", req.params.id);
    
    const image = await Image.findById(req.params.id)
        .populate('creator', 'name email avatar bio')
        .populate('comments.user', 'name avatar');
    
    if (!image) {
        console.log("Image not found");
        return res.redirect('/');
    }
    
    console.log("Image found, creator:", image.creator);
    
    // Increment views
    image.views += 1;
    await image.save();
    
    // Convert to plain object FIRST
    const plainImage = image.toObject();
    
    // Format tags as string
    const tagsString = plainImage.tags ? plainImage.tags.join(', ') : '';
    
    // Check ownership - convert IDs to strings for comparison
    let isOwner = false;
    if (req.user) {
        const userId = req.user._id?.toString() || req.user.id?.toString();
        const creatorId = plainImage.creator?._id?.toString();
        isOwner = userId === creatorId;
        console.log("User ID:", userId);
        console.log("Creator ID:", creatorId);
        console.log("Is Owner:", isOwner);
    }
    
    // Reverse comments for display (newest first)
    const comments = plainImage.comments ? [...plainImage.comments].reverse() : [];
    
    res.render('image-detail', {
        title: plainImage.title || 'Image',
        image: {
            ...plainImage,
            tagsString: tagsString,
            comments: comments
        },
        isOwner: isOwner,
        formatDate: formatDate
    });
    } catch (error) {
        console.error("Error in image detail:", error);
        res.redirect('/');
    }
});

// Edit image page - only owner or admin
router.get('/image/edit/:id', protect, async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.redirect('/dashboard');
        }
        
        // Check ownership or admin
        if (image.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.redirect('/dashboard');
        }
        
        const tagsString = image.tags.join(', ');
        
        res.render('edit-image', {
            title: 'Edit Artwork',
            image: {
                ...image.toObject(),
                tagsString
            }
        });
    } catch (error) {
        res.redirect('/dashboard');
    }
});

module.exports = router;