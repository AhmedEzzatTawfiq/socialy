import Notification from '../models/Notification.js';
import { sendSSEEvent } from './messageController.js';
import { emitToUser } from '../configs/socket.js';

// create notification
export const createNotification = async ({ sender, receiver, type, post, comment }) => {
    try {
        if (!sender || !receiver || sender === receiver) return null;

        const notification = await Notification.create({
            sender,
            receiver,
            type,
            post: post || null,
            comment: comment || null
        });

        const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'full_name username profile_picture')
            .populate('post', 'content image_urls post_type')
            .populate('comment', 'content');

        // Broadcast real-time WebSocket & SSE notification
        emitToUser(receiver, 'new_notification', populatedNotification);

        sendSSEEvent(receiver, {
            sseType: 'notification',
            notification: populatedNotification
        });

        return populatedNotification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

// Get user notifications
export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.auth();
        const notifications = await Notification.find({ receiver: userId })
            .populate('sender', 'full_name username profile_picture')
            .populate('post', 'content image_urls post_type')
            .populate('comment', 'content')
            .sort({ createdAt: -1 });

        const unreadCount = await Notification.countDocuments({ receiver: userId, isRead: false });

        res.json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { notificationId } = req.body || {};

        if (notificationId) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, receiver: userId },
                { isRead: true }
            );
        } else {
            // Mark all as read
            await Notification.updateMany(
                { receiver: userId, isRead: false },
                { isRead: true }
            );
        }

        const unreadCount = await Notification.countDocuments({ receiver: userId, isRead: false });
        res.json({ success: true, message: 'Notifications marked as read', unreadCount });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.auth();
        const unreadCount = await Notification.countDocuments({ receiver: userId, isRead: false });
        res.json({ success: true, unreadCount });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};
