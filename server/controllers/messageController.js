import fs from 'fs';
import imagekit from '../configs/imageKit.js';
import Message from '../models/Message.js';
import { emitToUser } from '../configs/socket.js';

export const connections = {};

export const sendSSEEvent = (userId, data) => {
    if (connections[userId]) {
        try {
            connections[userId].write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
            console.log("Error sending SSE to user:", userId, error);
        }
    }
};

export const sseController = (req, res) => {
    const userId = req.params.userId;

    console.log("New client connected:", userId);

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Save connection
    connections[userId] = res;

    // Send initial message (correct SSE format)
    res.write(`data: ${JSON.stringify({ message: "Connected", userId })}\n\n`);

    // Handle disconnect
    req.on("close", () => {
        delete connections[userId];
        console.log("Client disconnected:", userId);
    });
};


// send message
export const sendMessage = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { to_user_id, text } = req.body;
        const image = req.file
        let media_url = "";
        let message_type = image ? "image" : "text";

        if (message_type === "image") {
            const fileBuffer = fs.readFileSync(image.path)
            const result = await imagekit.upload({
                file: fileBuffer,
                fileName: image.originalname,
            });
            if (result && result.filePath) {
                media_url = imagekit.url({
                    path: result.filePath,
                    transformation: [
                        { quality: "auto" },
                        { format: "webp" },
                        { width: "1280" }
                    ]
                })
            }
        }
        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            media_url,
            message_type
        });
        res.json({ success: true, message });

        // Send message to_user_id using WebSocket & SSE
        const messageWithUserData = await Message.findById(message._id).populate("from_user_id");
        emitToUser(to_user_id, "new_message", messageWithUserData);

        if (connections[to_user_id]) {
            connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`);
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getChatMessages = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { to_user_id } = req.body
        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id },
                { from_user_id: to_user_id, to_user_id: userId }
            ]
        }).sort({ createdAt: -1 })
        await Message.updateMany({
            from_user_id: to_user_id,
            to_user_id: userId
        }, { seen: true })
        res.json({ success: true, messages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getRecentMessages = async (req, res) => {
    try {
        const { userId } = req.auth()
        const messages = await Message.find({
            $or: [
                { from_user_id: userId },
                { to_user_id: userId }
            ]
        }).populate("from_user_id to_user_id").sort({ createdAt: -1 })
        res.json({ success: true, messages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
