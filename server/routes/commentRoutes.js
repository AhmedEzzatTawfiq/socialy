import express from 'express';
import { protect } from "../middlewares/auth.js"
import { addComment, getComments, deleteComment, likeComment } from '../controllers/commentController.js';

const commentRouter = express.Router();

commentRouter.post("/add", protect, addComment)
commentRouter.get("/:postId", protect, getComments)
commentRouter.delete("/:commentId", protect, deleteComment)
commentRouter.post("/like/:commentId", protect, likeComment)

export default commentRouter;
