const cron = require('node-cron');
const Post = require('../models/Post');
const PublicationLog = require('../models/PublicationLog');

// Standalone function to run the check (can be called by Cron or API)
const publishScheduledPosts = async () => {
    console.log('Running scheduler logic to check for pending posts...');
    
    try {
        // Find posts that are scheduled and the schedule time has passed
        const postsToPublish = await Post.find({
            status: 'scheduled',
            scheduleDate: { $lte: new Date() }
        }).sort({ createdAt: 1 }); // Order by creation time if same schedule time

        if (postsToPublish.length === 0) {
            return { published: 0, message: 'No posts to publish' };
        }

        console.log(`Found ${postsToPublish.length} posts to publish.`);
        let successCount = 0;
        let failCount = 0;

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
                successCount++;
            } catch (err) {
                console.error(`Failed to publish post ${post._id}: ${err.message}`);
                
                post.status = 'failed';
                await post.save();

                await PublicationLog.create({
                    post: post._id,
                    status: 'failed',
                    message: `Failed to publish: ${err.message}`
                });
                failCount++;
            }
        }
        
        return { 
            published: successCount, 
            failed: failCount, 
            total: postsToPublish.length,
            message: `Processed ${postsToPublish.length} posts` 
        };
        
    } catch (error) {
        console.error('Error in background job:', error.message);
        throw error;
    }
};

const startScheduler = () => {
    // Only start local cron if NOT in production (Vercel uses Vercel Cron)
    if (process.env.NODE_ENV !== 'production') {
        // Run every minute
        cron.schedule('* * * * *', async () => {
            await publishScheduledPosts();
        });
        console.log('Local scheduler started (runs every minute)');
    } else {
        console.log('Production mode: Scheduler disabled (use Vercel Cron instead)');
    }
};

module.exports = { startScheduler, publishScheduledPosts };
