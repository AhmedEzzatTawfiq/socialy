import express from 'express';
import { upload } from "../configs/multer.js"
import { protect } from "../middlewares/auth.js"
import { addUserStory, getStories } from '../controllers/storyController.js';

const storyRouter = express.Router();

storyRouter.post("/add", upload.array('images', 10), protect, addUserStory);
storyRouter.get("feed", protect, getStories)

export default storyRouter;