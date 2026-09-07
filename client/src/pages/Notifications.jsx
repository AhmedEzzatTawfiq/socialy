import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { markNotificationsAsRead } from '../features/notifications/notificationsSlice';
import { useAuth } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
    Heart,
    MessageSquare,
    UserPlus,
    UserCheck,
    Bell,
    CheckCheck,
    Sparkles,
    ChevronRight,
    MessageCircle
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { fetchConnections } from '../features/connections/connectionsSlice';

const Notifications = () => {
    const { items: notifications, unreadCount, loading } = useSelector((state) => state.notifications);
    const dispatch = useDispatch();
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('all'); // 'all', 'likes', 'comments', 'connections'

    const handleMarkAllRead = async () => {
        const token = await getToken();
        if (token) {
            dispatch(markNotificationsAsRead({ token }));
            toast.success("All notifications marked as read");
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            const token = await getToken();
            if (token) {
                dispatch(markNotificationsAsRead({ token, notificationId: notif._id }));
            }
        }

        // Navigation based on notification type
        if (notif.type === 'connection_request' || notif.type === 'connection_accept') {
            navigate('/connections');
        } else if (notif.sender?._id) {
            navigate(`/profile/${notif.sender._id}`);
        } else {
            navigate('/');
        }
    };

    const handleAcceptConnection = async (e, senderId, notifId) => {
        e.stopPropagation();
        try {
            const token = await getToken();
            const { data } = await api.post(
                '/api/user/accept-connection-request',
                { id: senderId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success('Connection request accepted!');
                dispatch(fetchConnections(token));
                dispatch(markNotificationsAsRead({ token, notificationId: notifId }));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'like_post':
            case 'like_comment':
                return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
            case 'comment':
                return <MessageSquare className="w-4 h-4 text-indigo-500 fill-indigo-100" />;
            case 'connection_request':
                return <UserPlus className="w-4 h-4 text-blue-500" />;
            case 'connection_accept':
                return <UserCheck className="w-4 h-4 text-emerald-500" />;
            default:
                return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const getNotificationText = (notif) => {
        const senderName = notif.sender?.full_name || 'Someone';
        switch (notif.type) {
            case 'like_post':
                return (
                    <span>
                        <strong className="font-semibold text-gray-900">{senderName}</strong> liked your post.
                    </span>
                );
            case 'like_comment':
                return (
                    <span>
                        <strong className="font-semibold text-gray-900">{senderName}</strong> liked your comment.
                    </span>
                );
            case 'comment':
                return (
                    <span>
                        <strong className="font-semibold text-gray-900">{senderName}</strong> commented on your post:
                        {notif.comment?.content && (
                            <span className="italic text-gray-600 block mt-1 line-clamp-1 bg-gray-50 p-1.5 rounded-md border border-gray-100 text-xs font-normal">
                                "{notif.comment.content}"
                            </span>
                        )}
                    </span>
                );
            case 'connection_request':
                return (
                    <span>
                        <strong className="font-semibold text-gray-900">{senderName}</strong> sent you a connection request.
                    </span>
                );
            case 'connection_accept':
                return (
                    <span>
                        <strong className="font-semibold text-gray-900">{senderName}</strong> accepted your connection request.
                    </span>
                );
            default:
                return <span>New activity from <strong className="font-semibold text-gray-900">{senderName}</strong>.</span>;
        }
    };

    const filteredNotifications = notifications.filter((n) => {
        if (activeTab === 'likes') return n.type === 'like_post' || n.type === 'like_comment';
        if (activeTab === 'comments') return n.type === 'comment';
        if (activeTab === 'connections') return n.type === 'connection_request' || n.type === 'connection_accept';
        return true;
    });

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold bg-linear-to-r from-gray-900 via-indigo-950 to-gray-800 bg-clip-text text-transparent">
                                Notifications
                            </h1>
                            {unreadCount > 0 && (
                                <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Stay updated with likes, comments, and connection requests.
                        </p>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all duration-200 cursor-pointer self-start sm:self-auto border border-indigo-200/50"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                    { id: 'all', label: 'All' },
                    { id: 'likes', label: 'Likes' },
                    { id: 'comments', label: 'Comments' },
                    { id: 'connections', label: 'Connections' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200/80'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-100 overflow-hidden">
                {filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                            <Sparkles className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-base font-medium text-gray-600">No notifications yet</p>
                        <p className="text-xs text-gray-400 mt-1">When someone interacts with your posts or profile, you'll see it here.</p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => (
                        <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-4 sm:p-5 flex items-start gap-4 transition-all duration-200 cursor-pointer hover:bg-indigo-50/40 relative ${
                                !notif.isRead ? 'bg-indigo-50/20' : ''
                            }`}
                        >
                            {!notif.isRead && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-600 shadow-xs" />
                            )}

                            {/* Sender Avatar with icon badge */}
                            <div className="relative shrink-0">
                                <img
                                    src={notif.sender?.profile_picture || '/default-avatar.png'}
                                    alt={notif.sender?.full_name || 'User'}
                                    className="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-xs"
                                />
                                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white border border-gray-100 shadow-xs">
                                    {getIcon(notif.type)}
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-800 leading-snug">
                                    {getNotificationText(notif)}
                                </div>
                                <span className="text-[11px] text-gray-400 font-medium block mt-1.5">
                                    {moment(notif.createdAt).fromNow()}
                                </span>

                                {/* Connection Request Action */}
                                {notif.type === 'connection_request' && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <button
                                            onClick={(e) => handleAcceptConnection(e, notif.sender?._id, notif._id)}
                                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                                        >
                                            Accept Request
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate('/connections');
                                            }}
                                            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-all cursor-pointer"
                                        >
                                            View Request
                                        </button>
                                    </div>
                                )}
                            </div>

                            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 self-center" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
