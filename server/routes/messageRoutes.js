import express from 'express';
import { upload } from "../configs/multer.js"
import { protect } from "../middlewares/auth.js"
import { getChatMessages, sendMessage, sseController, getRecentMessages } from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.post("/recent-messages", protect, getRecentMessages)
messageRouter.post("/get", protect, getChatMessages)
messageRouter.post("/send", upload.single("image"), protect, sendMessage)
messageRouter.get("/:userId", sseController)

export default messageRouter;


