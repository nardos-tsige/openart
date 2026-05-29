const jwt = require('jsonwebtoken');
const User = require('../Models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;
    
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('✅ Token found in Authorization header');
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        console.log('✅ Token found in cookies');
    } else {
        console.log('❌ No token found');
    }
    
    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
    
    try {

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database (exclude password)
        const user = await User.findById(decoded.id).select('-password');
        req.user = user.toObject();
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };