const Post = require('../models/Post');


// @access  Private
exports.getPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const status = req.query.status;
        const platforms = req.query.platforms ? req.query.platforms.split(',') : null;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        let query = { user: req.user.id };
        
        // Status Filter
        if (status) {
            query.status = status;
        }

        // Platform Filter
        if (platforms && platforms.length > 0) {
            query.platforms = { $in: platforms };
        }

        // Date Range Filter
        if (startDate || endDate) {
            query.scheduleDate = {};
            if (startDate) query.scheduleDate.$gte = new Date(startDate);
            // set end date to end of day if only date string provided
            if (endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setHours(23, 59, 59, 999);
                query.scheduleDate.$lte = endDateTime;
            }
        }

        // Search functionality
        if (req.query.search) {
            query.content = { $regex: req.query.search, $options: 'i' };
        }

        const total = await Post.countDocuments(query);
        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            count: posts.length,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            },
            data: posts
        });
    } catch (err) {
        next(err);
    }
};


// @access  Private
exports.getPost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Make sure user owns post
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: post });
    } catch (err) {
        next(err);
    }
};

exports.createPost = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.user = req.user.id;

        // Check if date is in the future
        if (new Date(req.body.scheduleDate) <= new Date()) {
            return res.status(400).json({ success: false, message: 'Schedule date must be in the future' });
        }

        const post = await Post.create(req.body);

        res.status(201).json({ success: true, data: post });
    } catch (err) {
        next(err);
    }
};


exports.updatePost = async (req, res, next) => {
    try {
        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

       
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Check if post is already published
        if (post.status === 'published') {
            return res.status(400).json({ success: false, message: 'Cannot edit a published post' });
        }

        // Check date if it is being updated
        if (req.body.scheduleDate && new Date(req.body.scheduleDate) <= new Date()) {
            return res.status(400).json({ success: false, message: 'Schedule date must be in the future' });
        }

        post = await Post.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: post });
    } catch (err) {
        next(err);
    }
};

exports.deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Make sure user owns post
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await post.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
