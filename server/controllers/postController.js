import { upload } from "../configs/multer.js";
import fs from "fs";
import User from "../models/User.js";
import Post from "../models/post.js";
import imagekit from "../configs/imageKit.js";

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


        if (post.likes_count.includes(userId)) {
            post.likes_count = post.likes_count.filter(user => user !== userId);
        } else {
            post.likes_count.push(userId);
        }

        post.post_type = post.post_type || "text";

        await post.save();

        res.json({ success: true, Message: post.likes_count.includes(userId) ? "Post unliked" : "Post liked" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

