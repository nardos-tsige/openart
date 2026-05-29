const upload = require('../config/multer');

// Middleware to handle single image upload
const uploadImage = (req, res, next) => {
    const uploadSingle = upload.single('image');
    
    
    uploadSingle(req, res, function(err) {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
};

module.exports = uploadImage;