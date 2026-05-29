const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Regular routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Generate JWT token
        const token = jwt.sign(
            { id: req.user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // Redirect with token
        res.redirect(`/api/auth/google-success?token=${token}`);
    }
);

// Google login success handler
router.get('/google-success', (req, res) => {
    const token = req.query.token;
    
    if (!token) {
        return res.redirect('/login');
    }
    
    // Send HTML page that stores token and redirects
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Google Sign In Success</title>
            <script>
                const token = "${token}";
                localStorage.setItem('token', token);
                document.cookie = 'token=' + token + '; path=/; max-age=604800';
                window.location.href = '/dashboard';
            </script>
        </head>
        <body>
            <div style="text-align: center; padding: 50px; font-family: Arial;">
                <h2>✅ Signing you in...</h2>
                <p>Please wait while we redirect you.</p>
            </div>
        </body>
        </html>
    `);
});

module.exports = router;