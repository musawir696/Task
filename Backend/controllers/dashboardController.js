const Post = require('../models/Post');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = async (req, res, next) => {
    try {
        const totalPosts = await Post.countDocuments({ user: req.user.id });
        const scheduledPosts = await Post.countDocuments({ user: req.user.id, status: 'scheduled' });
        const publishedPosts = await Post.countDocuments({ user: req.user.id, status: 'published' });
        
        // Count by platform
        const platformCounts = await Post.aggregate([
            { $match: { user: req.user._id } },
            { $unwind: '$platforms' },
            { $group: { _id: '$platforms', count: { $sum: 1 } } }
        ]);

        const platformStats = {
            Twitter: 0,
            Facebook: 0,
            Instagram: 0
        };

        platformCounts.forEach(p => {
            platformStats[p._id] = p.count;
        });

        res.status(200).json({
            success: true,
            data: {
                totalPosts,
                scheduledPosts,
                publishedPosts,
                platformStats
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get upcoming scheduled posts
// @route   GET /api/dashboard/upcoming
// @access  Private
exports.getUpcoming = async (req, res, next) => {
    try {
        const posts = await Post.find({
            user: req.user.id,
            status: 'scheduled',
            scheduleDate: { $gte: new Date() }
        })
        .sort({ scheduleDate: 1 })
        .limit(5)
        .lean();

        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (err) {
        next(err);
    }
};
