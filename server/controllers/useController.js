import {asyncWrapProviders} from "async_hooks"
import imagekit from "../configs/imageKit.js"
import User from "../models/User.js"
import fs from "fs"
import path, { format } from "path"
import Connection from "../models/Connections.js"
import { inngest } from "../inngest/index.js"




//get user data using userId

export const getUserData = async (req, res) => {
    try{
        const {userId} = req.auth()
        const user = await User.findById(userId)
        if(!userId) {
            return res.json({success:false, message:"User not found"})
        }
        res.json({success:true, user})
    } catch(error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//update user data
export const updatUserData = async (req, res) => {
    try {
        const {userId} = req.auth()
        let {username, bio, location, full_name} = req.body
        const tempUser = await User.findById(userId)
        !username && (username = tempUser.username)

        if(tempUser.username !== username) {
            const user = await User.findOne({username})
            if (user) {
                username = tempUser.username
            }
        }

        const updatedData = {
            username, bio, location, full_name
        }

        const profile = req.files.profile[0]
        const cover = req.files.profile[0]

        if(profile) {
            const buffer = fs.readFileSync(profile.path)
            const response = await imageKit.upload({
                file:buffer,
                fileName:profile.originalname,
            })

            const url = imagekit.url({
                path:response.filePath,
                Transformation:[
                    {quality : "auto"},
                    {format:"webp"},
                    {with:"512"}
                ]
            })
            updatedData.profile_picture = url;
        }


        if(cover) {
            const buffer = fs.readFileSync(cover.path)
            const response = await imageKit.upload({
                file:buffer,
                fileName:profile.originalname,
            })

            const url = imagekit.url({
                path:response.filePath,
                Transformation:[
                    {quality : "auto"},
                    {format:"webp"},
                    {with:"512"}
                ]
            })
            updatedData.cover_photo = url;
        }

        const user = await User.findByIdAndUpdate(userId, updatedData, {new: true})
        res.json({success:true, user, message:"Profile update successfully"})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// find users using username, email, location, name
export const discoverUsers = async (req, res) => {
    try{
        const {userId} = req.auth()
    const input = req.body
    const allUsers = await User.find({
        $or:[
            {username : new RegExp(input, "i")},
            {email : new RegExp(input, "i")},
            {full_name : new RegExp(input, "i")},
            {location : new RegExp(input, "i")},
        ]
    })
    const filteredUsers = allUsers.filter(user => user._id != userId)
    res.json({success:true, users:filteredUsers})


    } catch (error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}


// follow User

export const followUser = async (req, res) => {
    try{
        const {userId} = req.auth()
        const {id} = req.body
        const user = await User.findById(userId)

        if(user.following.includes(id)) {
            res.json({success:false, message: "You already following this user"})
        }
        user.following.push(id);
        await user.save()

        const toUser = await User.findById(id)
        toUser.followers.push(userId)
        await toUser.save()
        req.json({success:true, message: "Now you are following this user"})
    } catch(error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// Unfollow User

export const unfollowUser = async (req, res) => {
    try {
        const {userId} = req.auth()
        const {id} = req.body
        const user = await User.findById(userId)
        user.following = user.following.filter(user => user !== id)
        await user.save()

        const toUser = await User.findById(id)
        toUser.followers = toUser.followers.filter(toUser => user !== userId)
        await toUser.save()
        res.json({success:true, message:"You are no longer following this user"})



    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// send connsection request

export const sendConnectionRequest = async (req, res) => {
    try{
        const {userId} = req.auth()
        const {id} = req.body
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const connectionRequests = await Connection.find({
            from_user_id: userId, created_at: {$gt:last24Hours}
        })
        if(connectionRequests.length >= 20) {
            return res.json({success:false, message:"You have sent more than 20 connection in the last 24 hours"})
        }
        const connection = await Connection.findOne({
            $or:[
                {from_user_id:userId, to_user_id:id},
                {from_user_id:userId, to_user_id:id}
            ]
        })
        if(!connection) {
            await Connection.create({
                from_user_id:userId,
                to_user_id:id
            })
            
            // Get user details for email
            const fromUser = await User.findById(userId)
            const toUser = await User.findById(id)
            
            // Send connection request email via Inngest
            await inngest.send({
                name: "connection/request.sent",
                data: {
                    toEmail: toUser.email,
                    fromUserName: fromUser.username
                }
            })
            
            return res.json({success:true, message:"Connection request sent successfully"})
        } else if (connection && connection.status === "accepted") {
            return res.json({success:false, message:"You have sent more than 20 connection request in last 24 Hours"})
        }
        return res.json({success:false, message:"Connection request pending"})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// get user connections

export const getuserConnections = async (req, res) => {
    try{
        const {userId} = req.auth()
    const user = await User.findById(userId).populate("connections followers following")
    const connections = user.connections
    const followers = user.followers
    const following = user.following
    const pendingConnections = (await Connection.find({to_user_id:userId, status:"pending"}).populate("from_user_id")).map(connection => connection.from_user_id)
    res.json({success:true, connections, followers, following, pendingConnections})
    } catch(error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// Accept connection request

export const acceptConnectionRequest = async (req, res) => {
    try{
        const {userId} = req.auth()
    const {id} = req.body
    const connection = await Connection.find({from_user_id:id, to_user_id:userId})
    if(!connection) {
        return res.json({success:false, message:"connection not found"})
    }
    const user = await User.findById(id) 
    user.connections.push(userId)
    await user.save()
    const toUser = await User.findById(userId)
    toUser.connections.push(id)
    await toUser.save()

    connection.status = "accepted"
    await connection.save()
    res.json({success:true, message:"Connection request accepted"})

} catch(error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}