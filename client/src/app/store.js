import { configureStore } from "@reduxjs/toolkit";
import { userSlice } from "../features/user/userSlice.js";
import connectionsReducers from "../features/connections/connectionsSlice.js";
import messagesReducer from "../features/messages/messagesSlice.js";
import notificationsReducer from "../features/notifications/notificationsSlice.js";

export const store = configureStore({
    reducer: {
        user: userSlice.reducer,
        connections: connectionsReducers,
        messages: messagesReducer,
        notifications: notificationsReducer
    }
})