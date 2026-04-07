import fs from 'fs'
import imagekit from '../configs/imageKit.js'
import Story from '../models/Story.js'
import User from '../models/User.js'
import { Inngest } from "inngest"

export const addUserStory = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { content, media_type, background_color } = req.body
        let media_url = ""
        if (media_type === 'image' || media_type === 'vedio') {
            const fileBuffer = fs.readFileSync(media_type.path)
            const result = await imagekit.upload({
                file: fileBuffer,
                fileName: media_type.originalname,
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
        await Inngest.send({
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
        const userIds = [userId, user.connections, ...user.following]
        const stories = await Story.find({ user: { $in: userIds } }).populate('user').sort({ createdAt: -1 })
        res.json({ success: true, stories })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: 'Internal server error' })
    }
}