import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
    items: [],
    unreadCount: 0,
    loading: false
};

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (token) => {
        const { data } = await api.get('/api/notifications', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return data.success ? data : { notifications: [], unreadCount: 0 };
    }
);

export const markNotificationsAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async ({ token, notificationId = null }) => {
        const { data } = await api.put(
            '/api/notifications/read',
            { notificationId },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return data.success ? { notificationId, unreadCount: data.unreadCount } : null;
    }
);

export const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addRealtimeNotification: (state, action) => {
            const newNotif = action.payload;
            // Prevent duplicate entries if already present
            if (!state.items.find(item => item._id === newNotif._id)) {
                state.items.unshift(newNotif);
                state.unreadCount += 1;
            }
        },
        clearUnreadCount: (state) => {
            state.unreadCount = 0;
            state.items.forEach(item => {
                item.isRead = true;
            });
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.items = action.payload.notifications;
                    state.unreadCount = action.payload.unreadCount;
                }
            })
            .addCase(fetchNotifications.rejected, (state) => {
                state.loading = false;
            })
            .addCase(markNotificationsAsRead.fulfilled, (state, action) => {
                if (action.payload) {
                    const { notificationId, unreadCount } = action.payload;
                    state.unreadCount = unreadCount;
                    if (notificationId) {
                        const target = state.items.find(item => item._id === notificationId);
                        if (target) target.isRead = true;
                    } else {
                        state.items.forEach(item => {
                            item.isRead = true;
                        });
                    }
                }
            });
    }
});

export const { addRealtimeNotification, clearUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
