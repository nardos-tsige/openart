const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/db');
const MongoStore = require('connect-mongo');

if (process.env.NODE_ENV === 'production') {
    console.log = function() {}; // Optional: disable logs in production
}

// Load environment variables
dotenv.config();

// Connect to database
connectDB().catch(err => console.error('DB connection error:', err));

// Import routes
const authRoutes = require('./routes/authRoutes');
const imageRoutes = require('./routes/imageRoutes');
const userRoutes = require('./routes/userRoutes');
const pageRoutes = require('./routes/pageRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// Static folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handlebars setup
const { engine } = require('express-handlebars');

// Helper functions for Handlebars
const helpers = {
    eq: function(a, b) {
        return a === b;
    },
    formatDate: function(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    truncate: function(str, len) {
        if (str.length > len && str.length > 0) {
            let new_str = str + ' ';
            new_str = str.substr(0, len);
            new_str = str.substr(0, new_str.lastIndexOf(' '));
            new_str = new_str.length > 0 ? new_str : str.substr(0, len);
            return new_str + '...';
        }
        return str;
    },
    json: function(context) {
        return JSON.stringify(context);
    }
};

app.engine('hbs', engine({ 
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: helpers
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to make user available to all views
app.use(async (req, res, next) => {
    res.locals.user = null;
    res.locals.formatDate = helpers.formatDate;
    
    let token = null;
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const User = require('./Models/User');
            const user = await User.findById(decoded.id).select('-password');
            
            if (user) {
                // Convert Mongoose document to plain JavaScript object
                const plainUser = user.toObject();
                res.locals.user = plainUser;
                req.user = plainUser;
            }
        } catch (error) {
            // Invalid token - ignore
        }
    }
    
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/users', userRoutes);

// Page Routes (must be after API routes to avoid conflicts)
app.use('/', pageRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).send(`
        <div style="text-align: center; padding: 50px; font-family: Arial;">
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <a href="/" style="color: #ec4899;">Go back home</a>
        </div>
    `);
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`
        <div style="text-align: center; padding: 50px; font-family: Arial;">
            <h1>500 - Server Error</h1>
            <p>Something went wrong on our end. Please try again later.</p>
            <a href="/" style="color: #ec4899;">Go back home</a>
        </div>
    `);
});

// Start server
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

// Export for Vercel serverless
module.exports = app;