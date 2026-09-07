import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:5173', 'https://socialyy.vercel.app'],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("WebSocket client connected:", socket.id);

        // Join user-specific room for targeted realtime broadcasts
        socket.on("join", (userId) => {
            if (userId) {
                socket.join(userId);
                console.log(`Socket ${socket.id} joined user room: ${userId}`);
            }
        });

        socket.on("disconnect", () => {
            console.log("WebSocket client disconnected:", socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const emitToUser = (userId, eventName, data) => {
    if (io && userId) {
        io.to(userId).emit(eventName, data);
    }
};
