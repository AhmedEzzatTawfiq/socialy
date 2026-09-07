import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    sender: { type: String, required: true, ref: 'User' },
    receiver: { type: String, required: true, ref: 'User' },
    type: {
        type: String,
        required: true,
        enum: ['like_post', 'like_comment', 'comment', 'connection_request', 'connection_accept']
    },
    post: { type: String, ref: 'Post', default: null },
    comment: { type: String, ref: 'Comment', default: null },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true,
    minimize: false
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
