const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot be more than 1000 characters'],
        default: ''
    },
    imageUrl: {
        type: String,
        required: [true, 'Please upload an image']
    },
    publicId: { 
        type: String
    },
    category: {
        type: String,
        enum: ['Photography', 'Digital Art', 'Painting', 'Illustration', 'Sculpture', 'Mixed Media'],
        default: 'Photography'
    },
    tags: [{
        type: String,
        trim: true
    }],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likesCount: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: {
            type: String,
            required: true,
            maxlength: [500, 'Comment cannot be more than 500 characters']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt on save
ImageSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Update likesCount when likes array changes
ImageSchema.pre('save', function(next) {
    this.likesCount = this.likes.length;
    next();
});

module.exports = mongoose.model('Image', ImageSchema);