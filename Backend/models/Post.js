const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Please add post content'],
        maxlength: [500, 'Content cannot be more than 500 characters']
    },
    platforms: {
        type: [String],
        required: [true, 'Please select at least one platform'],
        enum: ['Twitter', 'Facebook', 'Instagram']
    },
    scheduleDate: {
        type: Date,
        required: [true, 'Please add a schedule date']
    },
    imageUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'published', 'failed'],
        default: 'scheduled'
    }
}, {
    timestamps: true
});

// Indexes for performance
postSchema.index({ user: 1 });
postSchema.index({ status: 1 });
postSchema.index({ scheduleDate: 1 });

module.exports = mongoose.model('Post', postSchema);
