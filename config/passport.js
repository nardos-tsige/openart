const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../Models/User');

module.exports = function(passport) {
    console.log('📌 Initializing Passport Google Strategy');
    
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
        console.log('🎯 Google callback received for:', profile.emails[0].value);
        
        try {
            let user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
                console.log('✅ Existing user found:', user.name);
                return done(null, user);
            } else {
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: Math.random().toString(36).slice(-16),
                    role: 'viewer',
                    avatar: '🎨',
                    googleId: profile.id
                });
                console.log('✅ New user created:', user.name);
                return done(null, user);
            }
        } catch (err) {
            console.error('❌ Google auth error:', err);
            return done(err, null);
        }
    }));
    
    passport.serializeUser((user, done) => {
        console.log('📝 Serializing user:', user.id);
        done(null, user.id);
    });
    
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            console.log('📝 Deserializing user:', user?.name);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};