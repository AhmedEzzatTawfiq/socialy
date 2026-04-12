import fs from 'fs'
import imagekit from '../configs/imageKit.js'
import Story from '../models/Story.js'
import User from '../models/User.js'
import { inngest } from "../inngest/index.js"

export const addUserStory = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { content, media_type, background_color } = req.body
        let media_url = ""
        let media = req.file
        if ((media_type === 'image' || media_type === 'video') && media) {
            const fileBuffer = fs.readFileSync(media.path)
            const result = await imagekit.upload({
                file: fileBuffer,
                fileName: media.originalname,
            })
            media_url = result.url
        }
        // create story
        const story = await Story.create({
            user: userId,
            content,
            media_url,
            media_type,
            background_color,
        })
        await inngest.send({
            name: 'app/story.delete',
            data: { storyId: story._id },
        })
        res.json({ success: true, message: 'Story created successfully' })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: 'Internal server error' })
    }
}

//Get User Stories
export const getStories = async (req, res) => {
    try {
        const { userId } = req.auth()
        const user = await User.findById(userId)
        const userIds = [userId, ...(user.connections || []), ...(user.following || [])]
        const stories = await Story.find({ user: { $in: userIds } }).populate('user').sort({ createdAt: -1 })
        res.json({ success: true, stories })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: 'Internal server error' })
    }
}