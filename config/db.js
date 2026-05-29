const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (cached.promise) {
        return cached.promise;
    }

    const opts = {
        bufferCommands: true,
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 60000,  // 60 seconds
        socketTimeoutMS: 60000,
        connectTimeoutMS: 60000,
        family: 4,  // Force IPv4
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
        .then((mongoose) => {
            console.log('✅ MongoDB Connected');
            return mongoose;
        })
        .catch((err) => {
            console.error('❌ MongoDB Error:', err.message);
            cached.promise = null;
            throw err;
        });

    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = connectDB;