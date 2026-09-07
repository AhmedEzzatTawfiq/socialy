import Comment from '../models/Comment.js';
import Post from '../models/post.js';
import { createNotification } from './notificationController.js';

// Add comment
export const addComment = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { postId, content, parent_comment_id } = req.body;

        const comment = await Comment.create({
            post: postId,
            user: userId,
            content,
            parent_comment: parent_comment_id || null
        });

        // Increment comments count on post
        const post = await Post.findByIdAndUpdate(postId, { $inc: { comments_count: 1 } }, { new: true });

        // If it's a reply, add to parent's replies array
        let parentComment = null;
        if (parent_comment_id) {
            parentComment = await Comment.findByIdAndUpdate(parent_comment_id, {
                $push: { replies: comment._id }
            });
        }

        const populatedComment = await Comment.findById(comment._id)
            .populate('user', 'full_name username profile_picture')
            .populate('parent_comment', 'content user')
            .populate('replies');

        // send notifications
        if (post && post.user) {
            const postOwnerId = post.user.toString();
            await createNotification({
                sender: userId,
                receiver: postOwnerId,
                type: 'comment',
                post: postId,
                comment: comment._id
            });
        }

        if (parentComment && parentComment.user) {
            const parentCommentOwnerId = parentComment.user.toString();
            const postOwnerId = post ? post.user.toString() : null;
            if (parentCommentOwnerId !== postOwnerId) {
                await createNotification({
                    sender: userId,
                    receiver: parentCommentOwnerId,
                    type: 'comment',
                    post: postId,
                    comment: comment._id
                });
            }
        }

        res.json({ success: true, comment: populatedComment });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get comments for a post
export const getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ post: postId, parent_comment: null })
            .populate('user', 'full_name username profile_picture')
            .populate('replies')
            .sort({ createdAt: -1 });

        res.json({ success: true, comments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete comment
export const deleteComment = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.json({ success: false, message: 'Comment not found' });
        }

        if (comment.user.toString() !== userId) {
            return res.json({ success: false, message: 'Unauthorized' });
        }

        // Decrement comments count on post
        await Post.findByIdAndUpdate(comment.post, { $inc: { comments_count: -1 } });

        // If it has a parent, remove from parent's replies array
        if (comment.parent_comment) {
            await Comment.findByIdAndUpdate(comment.parent_comment, {
                $pull: { replies: commentId }
            });
        }

        // Delete all replies
        if (comment.replies.length > 0) {
            await Comment.deleteMany({ _id: { $in: comment.replies } });
        }

        await Comment.findByIdAndDelete(commentId);

        res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Like comment
export const likeComment = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.json({ success: false, message: 'Comment not found' });
        }

        const hasLiked = comment.likes_count.includes(userId);

        if (hasLiked) {
            comment.likes_count = comment.likes_count.filter(id => id !== userId);
        } else {
            comment.likes_count.push(userId);
        }

        await comment.save();

        if (!hasLiked) {
            await createNotification({
                sender: userId,
                receiver: comment.user.toString(),
                type: 'like_comment',
                post: comment.post,
                comment: commentId
            });
        }

        res.json({ success: true, comment });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
