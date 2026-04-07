import { upload } from "../configs/multer.js";
import fs from "fs";
import User from "../models/User.js";
import Post from "../models/post.js";

export const addPost = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { content, post_type } = req.body;
        let image_urls = [];
        if (imagekit.length) {
            image_urls = await Promise.all(image.map(async (image) => {
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
                        { width: "1280" }
                    ],
                })
                return url;
            }));
        }
        await Post.create({
            user_id: userId,
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
        const posts = await Post.find({ user: { $in: userIds } }).populate('user').sort({ created_at: -1 })
        res.json({ success: true, data: posts })
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
        if (post.likes_count.includes(userId)) {
            post.likes_count = post.likes_count.filter(user => user !== userId);
        } else {
            post.likes_count.push(userId);
            await post.save();
        }
        res.json({ success: true, Message: "Post liked" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

