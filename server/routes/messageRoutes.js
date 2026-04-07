import express from 'express';
import { upload } from "../configs/multer.js"
import { protect } from "../middlewares/auth.js"
import { getRecentMessages, sendMessage, sseController } from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.post("/get", protect, getRecentMessages)
messageRouter.post("/send", upload.single("image"), protect, sendMessage)
messageRouter.get("/:userId", sseController)

export default messageRouter;