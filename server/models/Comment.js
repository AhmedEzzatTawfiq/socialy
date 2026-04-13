import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    post: { type: String, required: true, ref: 'Post' },
    user: { type: String, required: true, ref: 'User' },
    content: { type: String, required: true },
    parent_comment: { type: String, ref: 'Comment', default: null },
    replies: [{ type: String, ref: 'Comment' }],
    likes_count: [
        {
            type: String,
            ref: 'User'
        }
    ]
}, {
    timestamps: true,
    minimize: false
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
