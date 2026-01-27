const cron = require('node-cron');
const Post = require('../models/Post');
const PublicationLog = require('../models/PublicationLog');

// Standalone function to run the check (can be called by Cron or API)
const publishScheduledPosts = async () => {
    console.log('Running scheduler logic to check for pending posts...');
    
    try {
       
        const postsToPublish = await Post.find({
            status: 'scheduled',
            scheduleDate: { $lte: new Date() }
        }).sort({ createdAt: 1 }); 

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
    // Start local cron if NOT on Vercel or if explicitly enabled
    // Vercel handles cron via API, while Render/Railway use this local timer
    if (process.env.VERCEL !== '1' || process.env.ENABLE_LOCAL_SCHEDULER === 'true') {
        // Run every minute
        cron.schedule('* * * * *', async () => {
            await publishScheduledPosts();
        });
        console.log('Local scheduler started (runs every minute)');
    } else {
        console.log('Vercel environment detected: Local scheduler disabled (use Vercel Cron)');
    }
};

module.exports = { startScheduler, publishScheduledPosts };
