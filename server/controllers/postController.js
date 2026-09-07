import { upload } from "../configs/multer.js";
import fs from "fs";
import User from "../models/User.js";
import Post from "../models/post.js";
import imagekit from "../configs/imageKit.js";
import { createNotification } from "./notificationController.js";

export const addPost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { content, post_type } = req.body;
        let image_urls = [];
        if (req.files && req.files.length > 0) {
            image_urls = await Promise.all(req.files.map(async (image) => {
                const fileBuffer = fs.readFileSync(image.path);
                const response = await imagekit.upload({
                    file: fileBuffer,
                    fileName: image.originalname,
                    folder: "posts"
                });
                const url = imagekit.url({
                    path: response.filePath,
                    transformation: [
                        { quality: "auto" },
                        { format: "webp" },
                        { width: "1280" },
                    ],
                })
                return url;
            }));
        }
        await Post.create({
            user: userId,
            content,
            post_type,
            image_urls
        })
        res.json({ success: true, message: "Post created successfully" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// Get Post

export const getFeedPosts = async (req, res) => {
    try {
        const { userId } = req.auth()
        const user = await User.findById(userId)
        const userIds = [userId, ...user.connections, ...user.following]
        const posts = await Post.find({ user: { $in: userIds } }).populate('user').sort({ createdAt: -1 })
        res.json({ success: true, posts })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};



//like post

export const likePost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { postId } = req.body;
        const post = await Post.findById(postId);

        if (!Array.isArray(post.likes_count)) {
            post.likes_count = [];
        }

        const isLiked = post.likes_count.includes(userId);

        if (isLiked) {
            post.likes_count = post.likes_count.filter(user => user !== userId);
        } else {
            post.likes_count.push(userId);
        }

        post.post_type = post.post_type || "text";

        await post.save();

        // Send notification if newly liked
        if (!isLiked) {
            await createNotification({
                sender: userId,
                receiver: post.user.toString(),
                type: 'like_post',
                post: postId
            });
        }

        res.json({ success: true, Message: !isLiked ? "Post liked" : "Post unliked" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Repost post
export const repostPost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { postId } = req.body;
        const originalPost = await Post.findById(postId);

        if (!originalPost) {
            return res.json({ success: false, message: 'Post not found' });
        }

        // Check if user already reposted this post
        const existingRepost = await Post.findOne({ user: userId, reposted_from: postId });
        if (existingRepost) {
            // Remove the repost
            await Post.findByIdAndDelete(existingRepost._id);
            // Decrement repost count on original post
            await Post.findByIdAndUpdate(postId, { $inc: { repost_count: -1 } });
            res.json({ success: true, message: 'Repost removed', reposted: false });
        } else {
            // Create new repost
            const repost = await Post.create({
                user: userId,
                content: originalPost.content,
                image_urls: originalPost.image_urls,
                post_type: originalPost.post_type,
                reposted_from: postId
            });

            // Increment repost count on original post
            await Post.findByIdAndUpdate(postId, { $inc: { repost_count: 1 } });

            const populatedRepost = await Post.findById(repost._id).populate('user');

            res.json({ success: true, post: populatedRepost, reposted: true });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Delete post
export const deletePost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { postId } = req.body;
        const post = await Post.findById(postId);

        if (!post) {
            return res.json({ success: false, message: 'Post not found' });
        }

        if (post.user.toString() !== userId) {
            return res.json({ success: false, message: 'You can only delete your own posts' });
        }

        // If this is a repost, decrement the repost count on the original post
        if (post.reposted_from) {
            await Post.findByIdAndUpdate(post.reposted_from, { $inc: { repost_count: -1 } });
        }

        // Delete all reposts of this post
        await Post.deleteMany({ reposted_from: postId });

        await Post.findByIdAndDelete(postId);
        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

