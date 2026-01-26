const Post = require('../models/Post');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
exports.getPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const status = req.query.status;

        let query = { user: req.user.id };
        if (status) {
            query.status = status;
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

// @desc    Get single post
// @route   GET /api/posts/:id
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

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
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

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
    try {
        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Make sure user owns post
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

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
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
