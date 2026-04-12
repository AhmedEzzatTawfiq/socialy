import React, { useState } from 'react'
import { BadgeCheck, Heart, Key, MessageCircle, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { useSelector } from 'react-redux'
import api from '../api/axios'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'

const PostCard = ({ post }) => {
    const navigate = useNavigate()
    const { getToken } = useAuth()
    const [likes, setLikes] = useState(Array.isArray(post.likes_count) ? post.likes_count : [])
    const currentUser = useSelector((state) => state.user.value)
    const handleLike = async () => {
        try {
            const token = await getToken()
            const { data } = await api.post('/api/post/like', { postId: post._id }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (data.success) {
                setLikes(prev => {
                    if (prev.includes(currentUser?._id)) {
                        return prev.filter(id => id !== currentUser._id)
                    } else {
                        return [...prev, currentUser._id]
                    }
                })
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const postWithHashtags = post.content
        ? post.content.replace(
            /(#\w+)/g,
            `<span class="text-indigo-600 font-semibold">$1</span>`
        )
        : ""

    return (
        <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl '>
            <div onClick={() => navigate(`/profile/${post.user._id}`)} className='inline-flex items-center gap-3 cursor-pointer'>
                <img src={post.user.profile_picture} className='w-10 h-10 rounded-full shadow' />
                <div>
                    <div className='flex items-center space-x-1'>
                        <span>
                            {post.user.full_name}
                        </span>
                        <BadgeCheck className='w-4 h-4 text-blue-500' />
                    </div>
                    <div className='text-gray-500 text-sm'>
                        {post.user.username} . {moment(post.createdAt).fromNow()}
                    </div>
                </div>
            </div>
            {
                post.content && <div className='text-gray-800 text-sm whitespace-pre-line'
                    dangerouslySetInnerHTML={{ __html: postWithHashtags }}
                />
            }

            {Array.isArray(post.image_urls) && post.image_urls.length > 0 && (
                <div className={`grid gap-2 ${post.image_urls.length === 1 ? 'grid-cols-1' : post.image_urls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                    {post.image_urls.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt=""
                            className={`w-full h-auto max-h-125 object-contain rounded-lg bg-gray-100`}
                        />
                    ))}
                </div>
            )}
            <div className='flex items-center gap-4 to-gray-600 text-sm border-gray-300'>
                <div className='flex items-center gap-1'>
                    <Heart className={`w-4 h-4 cursor-pointer 
                    ${Array.isArray(likes) && likes.includes(currentUser._id) && "text-red-500 fill-red-500"}`}
                        onClick={handleLike} />
                    <span>{likes.length}</span>
                </div>
                <div>
                    <MessageCircle className='flex items-center gap-1' />
                    <span>{12}</span>
                </div>
                <div className='flex items-center gap-1'>
                    <Share2 className='w-4 h-4' />
                    <span>{7}</span>
                </div>
            </div>
        </div>

    )
}

export default PostCard
