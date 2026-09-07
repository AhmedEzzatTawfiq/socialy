import express from 'express';
import { getNotifications, markAsRead, getUnreadCount } from '../controllers/notificationController.js';
import { requireAuth } from '@clerk/express';

const notificationRouter = express.Router();

notificationRouter.get('/', requireAuth(), getNotifications);
notificationRouter.put('/read', requireAuth(), markAsRead);
notificationRouter.get('/unread-count', requireAuth(), getUnreadCount);

export default notificationRouter;
