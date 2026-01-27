const cron = require('node-cron');
const Post = require('../models/Post');
const PublicationLog = require('../models/PublicationLog');

const startScheduler = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        console.log('Running scheduler to check for pending posts...');
        
        try {
            // Find posts that are scheduled and the schedule time has passed
            const postsToPublish = await Post.find({
                status: 'scheduled',
                scheduleDate: { $lte: new Date() }
            }).sort({ createdAt: 1 }); // Order by creation time if same schedule time

            if (postsToPublish.length === 0) {
                return;
            }

            console.log(`Found ${postsToPublish.length} posts to publish.`);

            for (const post of postsToPublish) {
                try {
                    // Update status
                    post.status = 'published';
                    await post.save();

                    // Create log
                    await PublicationLog.create({
                        post: post._id,
                        status: 'published',
                        message: `Post successfully published to: ${post.platforms.join(', ')}`
                    });

                    console.log(`Post ${post._id} published successfully.`);
                } catch (err) {
                    console.error(`Failed to publish post ${post._id}: ${err.message}`);
                    
                    post.status = 'failed';
                    await post.save();

                    await PublicationLog.create({
                        post: post._id,
                        status: 'failed',
                        message: `Failed to publish: ${err.message}`
                    });
                }
            }
        } catch (error) {
            console.error('Error in background job:', error.message);
        }
    });
};

module.exports = startScheduler;
