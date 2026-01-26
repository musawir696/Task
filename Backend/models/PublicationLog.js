const mongoose = require('mongoose');

const publicationLogSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        required: true
    },
    message: {
        type: String
    }
});

module.exports = mongoose.model('PublicationLog', publicationLogSchema);
