import { Calendar, MapPin, PenBox, User, UserPlus, MessageCircle, Plus, Verified } from 'lucide-react'
import moment from 'moment'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { fetchUser } from '../features/user/userSlice'

const UserProfileInfo = ({ user, posts, profileId, setShowEdit }) => {
    const currentUser = useSelector(state => state.user.value)
    const { getToken } = useAuth()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleFollow = async () => {
        try {
            const isFollowing = currentUser?.following.includes(user._id)
            const endpoint = isFollowing ? "/api/user/unfollow" : "/api/user/follow"
            const { data } = await api.post(endpoint, { id: user._id }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                toast.success(data.message)
                dispatch(fetchUser(await getToken()))
            } else {
                toast.error(data.message)
            }
        }
        catch (error) {
            toast.error(error.message)
        }
    }

    const handleConnectionRequest = async () => {
        if (currentUser.connections.includes(user._id)) {
            return navigate("/messages/" + user._id)
        }
        try {
            const { data } = await api.post("/api/user/connect", { id: user._id }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                toast.success(data.message)
                dispatch(fetchUser(await getToken()))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className='relative py-4 px-6 md:px-8 bg-white'>
            <div className='flex flex-col md:flex-row items-start gap-6'>
                <div className='w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden'>
                    {user.profile_picture ? (
                        <img src={user.profile_picture} alt="" className='w-full h-full object-cover rounded-full' />
                    ) : (
                        <User className='w-16 h-16 text-gray-400' />
                    )}
                </div>
                <div className='w-full pt-16 md:pt-0 md:pl-36'>
                    <div className='flex flex-col md:flex-row items-start justify-between'>
                        <div>
                            <div className='flex items-center gap-3 '>
                                <h1 className='text-2xl font-bold text-gray-900'>{user.full_name}</h1>
                                <Verified className='w-6 h-6 text-blue-500' />
                            </div>
                            <p>{user.username ? `@${user.username}` : "Add a username"}</p>
                        </div>
                        {
                            !profileId ? (
                                <button onClick={() => setShowEdit(true)}
                                    className='flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 rounded-lg font-medium transition-colors mt-4 md:mt-0 cursor-pointer'>
                                    <PenBox />
                                    Edit
                                </button>
                            ) : (
                                <div className='flex gap-2 mt-4 md:mt-0'>
                                    <button onClick={handleFollow}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium active:scale-95 transition text-white cursor-pointer
                                        ${currentUser?.following.includes(user._id)
                                                ? "bg-gray-600 hover:bg-gray-700"
                                                : "bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"}`}>
                                        <UserPlus className='w-4 h-4' />
                                        {currentUser?.following.includes(user._id) ? "Unfollow" : "Follow"}
                                    </button>
                                    <button onClick={handleConnectionRequest} className='flex items-center justify-center px-4 py-2 border border-gray-300 text-slate-500 rounded-lg hover:bg-gray-50 active:scale-95 transition cursor-pointer'>
                                        {
                                            currentUser?.connections.includes(user._id) ?
                                                <MessageCircle className='w-5 h-5' />
                                                :
                                                <Plus className='w-5 h-5' />
                                        }
                                    </button>
                                </div>
                            )
                        }
                    </div>
                    <p className='text-gray-700 text-sm max-w-md mt-4'>{user.bio}</p>
                    <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm to-gray-600 mt-4'>
                        <span className='flex items-center gap-1.5 '>
                            <MapPin className='w-4 h-4' />
                            {
                                user.location ? user.location : "no Location"
                            }
                        </span>
                        <span className='flex items-center gap-1.5'>
                            <Calendar className='w-4 h-4' />
                            Joined <span>{moment(user.createdAt).fromNow()}</span>
                        </span>
                    </div>
                    <div className='flex items-center gap-6 mt-6 border-t border-gray-200 pt-4'>
                        <div>
                            <span className='font-bold text-gray-900'>
                                {posts.length}
                            </span>
                            <span className='font-bold text-gray-900 ml-1.5'>
                                Posts
                            </span>
                        </div>
                        <div>
                            <span className='font-bold text-gray-900'>
                                {user.followers.length}
                            </span>
                            <span className='font-bold text-gray-900 ml-1.5'>
                                Followers
                            </span>
                        </div>
                        <div>
                            <span className='font-bold text-gray-900'>
                                {user.following.length}
                            </span>
                            <span className='font-bold text-gray-900 ml-1.5'>
                                Following
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfileInfo
