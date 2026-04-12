import express from "express"
import { protect } from "../middlewares/auth.js"
import { upload } from "../configs/multer.js"
import { acceptConnectionRequest, discoverUsers, followUser, getuserConnections, getUserData, getUserProfile, sendConnectionRequest, unfollowUser, updateUserData } from "../controllers/useController.js"
import { getRecentMessages } from "../controllers/messageController.js"

const userRouter = express.Router()

userRouter.get("/data", protect, getUserData)
userRouter.post("/update", upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 }
]), protect, updateUserData)

userRouter.post("/discover", protect, discoverUsers)
userRouter.post("/follow", protect, followUser)
userRouter.post("/unfollow", protect, unfollowUser)
userRouter.post("/connect", protect, sendConnectionRequest)
userRouter.post("/accept", protect, acceptConnectionRequest)
userRouter.get("/connections", protect, getuserConnections)
userRouter.post("/profiles", getUserProfile)
userRouter.post("/recent-messages", protect, getRecentMessages)

export default userRouter